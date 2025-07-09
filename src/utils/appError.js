class AppError extends Error {
	constructor(message, statusCode) {
		// Llama al constructor de la clase base (Error)
		super(message)

		// Asigna el código de estado y el estado ('fail' o 'error')
		this.statusCode = statusCode
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'

		// Marca este error como un error operacional (predecible), no un bug.
		this.isOperational = true

		// Captura el stack trace para saber dónde ocurrió el error, excluyendo el constructor de AppError.
		Error.captureStackTrace(this, this.constructor)
	}
}

module.exports = AppError
