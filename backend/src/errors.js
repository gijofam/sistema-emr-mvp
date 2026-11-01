export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export const notFound = () =>
  new AppError(404, 'PRENDA_NO_ENCONTRADA', 'Este código no pertenece a una prenda EMR activa.')
