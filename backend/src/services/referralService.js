import { randomBytes } from 'node:crypto'
import { db } from '../prisma/db.ts'
import { AppError, notFound } from '../errors.js'

export const getPublicReferral = async (codigoReferido, client = db) => {
  const referral = await client.orm.public.Referido.where({ codigoReferido }).first()
  if (!referral) throw new AppError(404, 'INVITACION_NO_DISPONIBLE', 'Esta invitación EMR no está disponible.')
  return { codigoReferido: referral.codigoReferido, valido: true }
}

const referralState = (referrals) => {
  const conversions = referrals.filter((item) => item.estado === 'CONVERTIDO').length
  return {
    codigoReferido: referrals[0]?.codigoReferido || null,
    personasIniciadas: conversions,
    objetivo: 5,
    recompensaDesbloqueada: conversions >= 5,
  }
}

const findPrenda = async (client, token) => {
  const prenda = await client.orm.public.Prenda.where({ token }).first()
  if (!prenda) throw notFound()
  return prenda
}

export const getReferral = async (token) => {
  const prenda = await findPrenda(db, token)
  const referrals = Array.from(await db.orm.public.Referido.where({ prendaOrigenId: prenda.id }).all())
  return referralState(referrals)
}

export const createReferral = async (token) => db.transaction(async (tx) => {
  const prenda = await findPrenda(tx, token)
  let referrals = Array.from(await tx.orm.public.Referido.where({ prendaOrigenId: prenda.id }).all())
  if (referrals.length === 0) {
    const codigoReferido = `EMR-${randomBytes(4).toString('hex').toUpperCase()}`
    referrals = [await tx.orm.public.Referido.create({ prendaOrigenId: prenda.id, codigoReferido })]
  }
  return referralState(referrals)
})
