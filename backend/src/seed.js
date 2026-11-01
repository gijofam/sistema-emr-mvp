import 'dotenv/config'
import { db } from './prisma/db.ts'

const phrases = [
  [84, 'No necesitas volver a empezar. Necesitas dejar de abandonar.', 'DISCIPLINA'],
  [17, 'La calma también es una forma de fortaleza.', 'FORTALEZA_MENTAL'],
  [31, 'Lo que hoy pesa, mañana será parte de tu carácter.', 'RESILIENCIA'],
  [46, 'Avanzar lento sigue siendo avanzar.', 'CONSTANCIA'],
  [59, 'Tu propósito se demuestra en lo que haces cuando nadie mira.', 'PROPOSITO'],
  [72, 'No eres el momento en que caíste. Eres la decisión de levantarte.', 'RENACER'],
  [93, 'La evolución comienza cuando dejas de negociar con tu disciplina.', 'EVOLUCION'],
  [108, 'El quiebre no fue el final. Fue el lugar donde elegiste cambiar.', 'QUIEBRE'],
]

try {
  for (const [codigo, texto, categoria] of phrases) {
    if (!await db.orm.public.Frase.where({ codigo }).first()) {
      await db.orm.public.Frase.create({ codigo, texto, categoria, activa: true })
    }
  }
  const developmentGarments = [
    { token: 'A81KX9', tipoPrenda: 'POLO' },
    { token: 'PRF-F6A2K4', tipoPrenda: 'POLO_REGULAR_FIT' },
    { token: 'MC-CB83E6', tipoPrenda: 'MANGA_CERO' },
  ]
  for (const garment of developmentGarments) {
    if (!await db.orm.public.Prenda.where({ token: garment.token }).first()) {
      await db.orm.public.Prenda.create({ ...garment, etapaEmr: 'RENACER', estado: 'GENERADA' })
    }
  }
  console.log(`Seed EMR completado. Tokens de desarrollo: ${developmentGarments.map(({ token }) => token).join(', ')}`)
} finally {
  await db.close()
}
