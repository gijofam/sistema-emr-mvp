import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { frases } from '../data/frases.js'

const CATEGORIES = [
  'QUIEBRE', 'RENACER', 'EVOLUCION', 'DISCIPLINA', 'CONSTANCIA',
  'RESILIENCIA', 'FORTALEZA_MENTAL', 'PROPOSITO', 'IDENTIDAD', 'AUTODOMINIO',
]

export function validateFrases(entries = frases) {
  if (entries.length !== 500) throw new Error(`Se esperaban 500 frases, hay ${entries.length}.`)
  const codes = new Set()
  const texts = new Set()
  const distribution = Object.fromEntries(CATEGORIES.map((category) => [category, 0]))

  for (let index = 0; index < entries.length; index++) {
    const phrase = entries[index]
    if (phrase.codigo !== index + 1 || codes.has(phrase.codigo)) {
      throw new Error(`Código ausente, repetido o fuera de orden: ${phrase.codigo}.`)
    }
    if (typeof phrase.texto !== 'string' || !phrase.texto || texts.has(phrase.texto)) {
      throw new Error(`Texto vacío o duplicado en el código ${phrase.codigo}.`)
    }
    if (!Object.hasOwn(distribution, phrase.categoria)) {
      throw new Error(`Categoría inválida en el código ${phrase.codigo}: ${phrase.categoria}.`)
    }
    if (phrase.activa !== true) throw new Error(`La frase ${phrase.codigo} no está activa.`)
    codes.add(phrase.codigo)
    texts.add(phrase.texto)
    distribution[phrase.categoria]++
  }
  return distribution
}

export function compareWithSource(entries = frases) {
  const sourcePath = [
    '../../../material/banco-frases-emr.txt',
    '../../../frontend/material/banco-frases-emr.txt.txt',
  ].map((path) => fileURLToPath(new URL(path, import.meta.url))).find(existsSync)
  if (!sourcePath) throw new Error('No se encontró el banco original de frases.')
  const source = readFileSync(sourcePath, 'utf8')
  const matches = [...source.matchAll(/^\*\*(\d{3})\.\*\* ([^\r\n]+)\r?$/gm)]
  if (matches.length !== 500) throw new Error(`El archivo origen contiene ${matches.length} frases numeradas.`)
  for (let index = 0; index < matches.length; index++) {
    if (Number(matches[index][1]) !== entries[index]?.codigo || matches[index][2] !== entries[index]?.texto) {
      throw new Error(`El texto o código ${index + 1} no coincide con el archivo origen.`)
    }
  }
  return sourcePath
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const distribution = validateFrases()
  const source = compareWithSource()
  console.log(`Origen: ${source}`)
  for (const category of CATEGORIES) console.log(`${category}: ${distribution[category]}`)
  console.log('TOTAL: 500; códigos 1–500; sin textos ni códigos repetidos; textos idénticos al origen.')
}
