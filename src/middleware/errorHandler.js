/**
 * @description Middleware global para el manejo de errores. Captura todos los errores
 * pasados a través de next(error) y envía una respuesta de error estandarizada.
 * @param {Error} error - El objeto de error.
 * @param {object} peticion - El objeto de la petición de Express.
 * @param {object} respuesta - El objeto de la respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */

const errorHandler = (error, peticion, respuesta, next) => {
	// Imprimimos el error completo en la consola del servidor. (para nosotros)
	// .stack nos da la traza completa del error.
	console.error(error.stack)
	// Determinar el código de estado
	// Si el error ya tiene un código de estado (porque lo establecimos en otro lugar),
	// lo usamos. Si no, por defecto es un error 500 - Internal Server Error.
	const statusCode = error.statusCode || 500
	// Determinar el mensaje de error
	// De nuevo, si el error tiene un mensaje, lo usamos.
	// Si no, enviamos un mensaje genérico.
	const mensaje = error.message || 'Ha ocurrido un error interno en el servidor.'
	// Enviar la respuesta de error al cliente
    // Enviamos una respuesta JSON estandarizada.
    respuesta.status(statusCode).json({
		error: {
			mensaje: mensaje,
			// Opcional: Solo en desarrollo, podríamos enviar más detalles.
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
		},
	})
}

module.exports = errorHandler