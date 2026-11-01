import { BRAND } from '../config/brand'

const loadLogo = () => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error('No pudimos cargar el logo EMR.'))
  image.src = BRAND.shareLogoUrl
})

const wrapText = (context, text, maxWidth) => {
  const words = text.split(/\s+/)
  const lines = []
  let line = ''
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = candidate
  })
  if (line) lines.push(line)
  return lines
}

export const createMessageImage = async (message) => {
  const logo = await loadLogo()
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const context = canvas.getContext('2d')
  const gradient = context.createLinearGradient(0, 0, 1080, 1920)
  gradient.addColorStop(0, '#090a0a')
  gradient.addColorStop(1, '#000000')
  context.fillStyle = gradient
  context.fillRect(0, 0, 1080, 1920)
  context.strokeStyle = '#252926'
  context.lineWidth = 2
  context.strokeRect(88, 88, 904, 1744)
  context.textAlign = 'center'
  const logoWidth = 270
  const logoHeight = logoWidth * logo.naturalHeight / logo.naturalWidth
  context.drawImage(logo, (1080 - logoWidth) / 2, 250 - logoHeight / 2, logoWidth, logoHeight)
  context.letterSpacing = '16px'
  context.fillStyle = '#929992'
  context.font = '500 30px Arial, sans-serif'
  context.fillText(`TU MENSAJE #${String(message.codigo).padStart(3, '0')}`, 540, 580)
  context.fillStyle = '#f4f3ef'
  context.font = '400 58px Arial, sans-serif'
  const lines = wrapText(context, message.texto, 790)
  const startY = 900 - ((lines.length - 1) * 42)
  lines.forEach((line, index) => context.fillText(line, 540, startY + index * 84))
  context.fillStyle = '#7e887f'
  context.font = '500 25px Arial, sans-serif'
  context.fillText('@ELMACHORENACE', 540, 1660)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1))
  if (!blob) throw new Error('No pudimos generar la imagen EMR.')
  return new File([blob], `mensaje-emr-${message.codigo}-logo-sd.png`, { type: 'image/png' })
}

export const downloadMessageImage = async (message) => {
  const file = await createMessageImage(message)
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}

export const shareMessageImage = async (message, file) => {
  if (!navigator.share) return 'unavailable'

  if (file && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Mi mensaje EMR', text: 'Este mensaje estaba dentro de mi prenda EMR.' })
    return 'shared'
  }

  await navigator.share({ title: 'Mi mensaje EMR', text: message.texto })
  return 'shared-text'
}
