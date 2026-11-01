import { db } from '../prisma/db.ts'
import { notFound } from '../errors.js'

export const saveWhatsapp = async (token, numero) => db.transaction(async (tx) => {
  const prenda = await tx.orm.public.Prenda.where({ token }).first()
  if (!prenda) throw notFound()

  let contacto = await tx.orm.public.ContactoWhatsapp.where({ numero }).first()
  if (!contacto) contacto = await tx.orm.public.ContactoWhatsapp.create({ numero, activo: true })
  else if (!contacto.activo) {
    await tx.orm.public.ContactoWhatsapp.where({ id: contacto.id }).update({ activo: true })
    contacto = { ...contacto, activo: true }
  }

  await tx.orm.public.Prenda.where({ id: prenda.id }).update({ contactoWhatsappId: contacto.id })
  return { registrado: true, numero: contacto.numero }
})
