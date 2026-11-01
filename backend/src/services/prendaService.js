import { db } from '../prisma/db.ts'
import { config } from '../config.js'
import { AppError, notFound } from '../errors.js'

const publicMessage = (message) => ({
  numeroMensaje: message.numeroMensaje,
  fechaDesbloqueo: message.fechaDesbloqueo,
  codigo: message.frase.codigo,
  texto: message.frase.texto,
  categoria: message.frase.categoria,
})

const readPrenda = async (client, token) => {
  const prenda = await client.orm.public.Prenda.where({ token }).first()
  if (!prenda) throw notFound()
  if (prenda.estado === 'INACTIVA') {
    throw new AppError(410, 'PRENDA_INACTIVA', 'Esta prenda EMR no se encuentra activa.')
  }
  return prenda
}

const readMessages = async (client, prendaId) => {
  const rows = await client.orm.public.MensajePrenda
    .where({ prendaId })
    .include('frase')
    .orderBy((message) => message.numeroMensaje.asc())
    .all()
  return Array.from(rows)
}

const buildProgress = (prenda, messages) => {
  const latest = messages.at(-1)
  const completed = messages.length >= 3
  const nextAvailableAt = latest && !completed
    ? new Date(Date.parse(latest.fechaDesbloqueo) + config.unlockDelayMs).toISOString()
    : null
  return {
    token: prenda.token,
    tipoPrenda: prenda.tipoPrenda,
    etapaEmr: prenda.etapaEmr,
    estado: completed ? 'COMPLETADA' : prenda.estado,
    fechaActivacion: prenda.fechaActivacion,
    mensajesDesbloqueados: messages.length,
    totalMensajes: 3,
    nextAvailableAt,
    canUnlock: !completed && (!nextAvailableAt || Date.now() >= Date.parse(nextAvailableAt)),
    serverTime: new Date().toISOString(),
  }
}

export const getPrendaState = async (token) => {
  const prenda = await readPrenda(db, token)
  const messages = await readMessages(db, prenda.id)
  return buildProgress(prenda, messages)
}

export const getMessages = async (token) => {
  const prenda = await readPrenda(db, token)
  const messages = await readMessages(db, prenda.id)
  return { ...buildProgress(prenda, messages), mensajes: messages.map(publicMessage) }
}

const choosePhrase = (available) => available[Math.floor(Math.random() * available.length)]

export const unlockNextMessage = async (token) => {
  try {
    return await db.transaction(async (tx) => {
      const prenda = await readPrenda(tx, token)
      const messages = await readMessages(tx, prenda.id)
      const progress = buildProgress(prenda, messages)

      if (messages.length >= 3) {
        throw new AppError(409, 'RECORRIDO_COMPLETADO', 'Tu prenda ya reveló sus tres mensajes EMR.', {
          ...progress,
          mensajes: messages.map(publicMessage),
        })
      }
      if (!progress.canUnlock) {
        throw new AppError(423, 'MENSAJE_AUN_BLOQUEADO', 'El siguiente mensaje todavía está tomando forma.', {
          ...progress,
          mensajes: messages.map(publicMessage),
        })
      }

      const phrases = Array.from(await tx.orm.public.Frase.where({ activa: true }).all())
      const used = new Set(messages.map((message) => message.fraseId))
      const phrase = choosePhrase(phrases.filter((candidate) => !used.has(candidate.id)))
      if (!phrase) {
        throw new AppError(503, 'SIN_MENSAJES_DISPONIBLES', 'El mensaje no pudo ser revelado en este momento.')
      }

      const now = new Date().toISOString()
      const number = messages.length + 1
      const created = await tx.orm.public.MensajePrenda.create({
        prendaId: prenda.id,
        fraseId: phrase.id,
        numeroMensaje: number,
        fechaDesbloqueo: now,
      })
      await tx.orm.public.Frase
        .where({ id: phrase.id })
        .update({ vecesMostrada: phrase.vecesMostrada + 1 })

      const stateUpdate = number === 3
        ? { estado: 'COMPLETADA' }
        : prenda.estado === 'GENERADA'
          ? { estado: 'ACTIVA', fechaActivacion: now }
          : null
      if (stateUpdate) await tx.orm.public.Prenda.where({ id: prenda.id }).update(stateUpdate)

      const message = { ...created, frase: phrase }
      const nextMessages = [...messages, message]
      return {
        ...buildProgress({ ...prenda, ...stateUpdate }, nextMessages),
        mensaje: publicMessage(message),
        mensajes: nextMessages.map(publicMessage),
      }
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    if (error?.sqlState !== '23505') throw error
    const current = await getMessages(token)
    if (current.mensajes.length > 0) {
      return { ...current, mensaje: current.mensajes.at(-1), concurrentReplay: true }
    }
    throw error
  }
}
