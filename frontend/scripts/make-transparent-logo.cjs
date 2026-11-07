const fs = require('node:fs')
const path = require('node:path')

const source = path.join(__dirname, '../src/assets/images/emr_logo_reconstruction_once.gif')
const output = path.join(__dirname, '../src/assets/images/emr_logo_reconstruction_transparent.gif')
const gif = fs.readFileSync(source)

if (gif.toString('ascii', 0, 6) !== 'GIF89a') throw new Error('El archivo no es un GIF89a.')

let offset = 13
const globalPaletteSize = gif[10] & 0x80 ? 3 * (1 << ((gif[10] & 7) + 1)) : 0
if (!globalPaletteSize || gif.subarray(offset, offset + 3).some(Boolean)) {
  throw new Error('El primer color de la paleta global debe ser negro.')
}
offset += globalPaletteSize

let controlOffset = null
let frames = 0
while (offset < gif.length) {
  const block = gif[offset++]
  if (block === 0x3b) break

  if (block === 0x21) {
    const label = gif[offset++]
    if (label === 0xf9) {
      if (gif[offset++] !== 4) throw new Error('Extensión de fotograma inesperada.')
      controlOffset = offset
      offset += 5
    } else {
      if (label === 0xff || label === 0x01) offset += 1 + gif[offset]
      while (gif[offset]) offset += 1 + gif[offset]
      offset++
    }
    continue
  }

  if (block !== 0x2c || controlOffset === null) throw new Error('Estructura GIF inesperada.')
  const width = gif.readUInt16LE(offset + 4)
  const height = gif.readUInt16LE(offset + 6)
  const framePacked = gif[offset + 8]
  offset += 9
  const paletteSize = framePacked & 0x80 ? 3 * (1 << ((framePacked & 7) + 1)) : 0
  if (width !== 512 || height !== 512 || (paletteSize && gif.subarray(offset, offset + 3).some(Boolean))) {
    throw new Error('El fotograma no tiene el tamaño o la paleta esperados.')
  }

  // Cada fotograma ocupa el lienzo completo. Conservamos su duración y
  // eliminación, y hacemos transparente el índice negro de su paleta.
  gif[controlOffset] |= 1
  gif[controlOffset + 3] = 0
  frames++
  controlOffset = null

  offset += paletteSize + 1
  while (gif[offset]) offset += 1 + gif[offset]
  offset++
}

if (frames !== 57) throw new Error(`Se esperaban 57 fotogramas, se encontraron ${frames}.`)
fs.writeFileSync(output, gif)
console.log(`Logo transparente creado: ${frames} fotogramas, ${output}`)
