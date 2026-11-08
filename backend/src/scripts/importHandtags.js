import 'dotenv/config'
import pg from 'pg'
import { buildImportPlan, summarizeGarments } from './handtagsImportPlan.js'

const parseArgs = (args) => {
  const options = { apply: false, batchIds: [] }
  for (const arg of args) {
    if (arg === '--apply') options.apply = true
    else if (arg.startsWith('--batch-id=')) options.batchIds.push(arg.slice(11))
    else if (arg.startsWith('--confirm-count=')) options.confirmCount = Number(arg.slice(16))
    else if (arg.startsWith('--confirm-target=')) options.confirmTarget = arg.slice(17)
    else throw new Error(`Opción desconocida: ${arg}`)
  }
  if (options.batchIds.some((id) => !id.trim())) throw new Error('El ID de lote no puede estar vacío.')
  return options
}

const describeTarget = (url) => {
  const parsed = new URL(url)
  return `${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`
}

const getConnections = () => {
  const targetUrl = process.env.EMR_IMPORT_DATABASE_URL || process.env.DATABASE_URL
  if (!targetUrl) throw new Error('Configura DATABASE_URL o EMR_IMPORT_DATABASE_URL para EMR.')

  let sourceUrl = process.env.HANDTAGS_DATABASE_URL
  if (!sourceUrl) {
    const localEmr = new URL(process.env.DATABASE_URL || targetUrl)
    if (!['localhost', '127.0.0.1', '[::1]'].includes(localEmr.hostname)) {
      throw new Error('Configura HANDTAGS_DATABASE_URL para leer Handtags desde tu laptop.')
    }
    localEmr.pathname = '/emr_handtag_generator'
    sourceUrl = localEmr.href
  }
  const source = new URL(sourceUrl)
  if (!['localhost', '127.0.0.1', '[::1]'].includes(source.hostname)) {
    throw new Error('La base de Handtags debe estar en esta laptop (localhost).')
  }
  if (describeTarget(sourceUrl) === describeTarget(targetUrl)) {
    throw new Error('Handtags y EMR no pueden apuntar a la misma base de datos.')
  }
  return { sourceUrl, targetUrl }
}

const readSource = async (client, batchIds) => {
  const result = await client.query(`
    SELECT c.code, c."qrUrl", c.status::text AS status, p.prefix AS "productPrefix"
    FROM public.handtag_codes AS c
    LEFT JOIN public.products AS p ON p.id = c."productId"
    WHERE (cardinality($1::text[]) = 0 OR c."batchId" = ANY($1::text[]))
    ORDER BY c.code
  `, [batchIds])
  return result.rows
}

const readExisting = async (client, tokens) => {
  const result = await client.query(`
    SELECT token, "tipoPrenda" FROM public.prenda WHERE token = ANY($1::text[])
  `, [tokens])
  return new Map(result.rows.map((row) => [row.token, row.tipoPrenda]))
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))
  const { sourceUrl, targetUrl } = getConnections()
  const targetName = describeTarget(targetUrl)
  const source = new pg.Client({ connectionString: sourceUrl })
  const target = new pg.Client({ connectionString: targetUrl })
  try {
    await source.connect()
    await target.connect()

    const garments = buildImportPlan(await readSource(source, options.batchIds))
    const tokens = garments.map((garment) => garment.token)
    const existing = await readExisting(target, tokens)
    for (const garment of garments) {
      if (existing.has(garment.token) && existing.get(garment.token) !== garment.tipoPrenda) {
        throw new Error(`El código ${garment.token} ya existe en EMR con otro tipo de prenda.`)
      }
    }
    const pending = garments.filter((garment) => !existing.has(garment.token))
    console.log(JSON.stringify({ target: targetName, total: garments.length,
      porTipo: summarizeGarments(garments), existentes: existing.size, pendientes: pending.length }, null, 2))

    if (!options.apply) {
      console.log('Vista previa: no se escribió en ninguna base de datos.')
      return
    }
    if (options.confirmTarget !== targetName || options.confirmCount !== garments.length) {
      throw new Error(`Para importar, añade --confirm-target=${targetName} --confirm-count=${garments.length}`)
    }

    await target.query('BEGIN')
    try {
      const result = await target.query(`
        INSERT INTO public.prenda (token, "tipoPrenda", "etapaEmr", estado)
        SELECT token, tipo, 'RENACER', 'GENERADA'
        FROM unnest($1::text[], $2::text[]) AS entrada(token, tipo)
        ON CONFLICT (token) DO NOTHING
      `, [tokens, garments.map((garment) => garment.tipoPrenda)])
      const verified = await readExisting(target, tokens)
      if (verified.size !== garments.length || garments.some((garment) => verified.get(garment.token) !== garment.tipoPrenda)) {
        throw new Error('La verificación de los códigos importados falló; se revertirá la operación.')
      }
      await target.query('COMMIT')
      console.log(`Importación completada: ${result.rowCount} nuevas prendas; ${garments.length - result.rowCount} ya existentes.`)
    } catch (error) {
      await target.query('ROLLBACK')
      throw error
    }
  } finally {
    await Promise.allSettled([source.end(), target.end()])
  }
}

main().catch((error) => {
  console.error(`Importación cancelada: ${error.message}`)
  process.exitCode = 1
})
