const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const db = require('../config/db')
const queries = require('../queries/authQueries')
/**
 * @description Middleware para proteger rutas que requieren autenticación.
 * Verifica el JWT y adjunta el usuario a la petición.
 */

const protegeRuta = async (req, res, next) => {
	try {
		// 1. Obtener el token y verificar si existe.
		let token
		// La convención es enviar el token en la cabecera 'Authorization'
		// con el formato 'Bearer TOKEN'.
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			// Extraemos el token quitando la parte 'Bearer '
			token = req.headers.authorization.split(' ')[1]
		}
		if (!token) {
			return next(
				new AppError(
					'No estas autenticado. Por favor inicia sesion para obtener acceso',
					401
				)
			)
		}
		// 2. Verificar la validez del token.
		// 'jwt.verify' decodifica el token. Si es inválido (firma incorrecta o expirado),
		// lanzará un error que será capturado por el bloque catch.
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		// 3. Verificar si el usuario del token todavía existe.
		// Esto es una medida de seguridad importante. Si un usuario fue eliminado
		// después de que su token fue emitido, no debería poder acceder.
		// desestructuro rows y lo renombro
		const results = await db.query(queries.USUARIO_TOKEN, [decoded.id])
		const usuario = results.rows[0]
		console.log(usuario.estado)

		if (!usuario) {
			return next(
				new AppError(
					'El usuario perteneciente a este token, ya no existe',
					401
				)
			)
		}
		// 4. Verificar si el usuario está 'activo'.
		// Podríamos tener usuarios 'suspendidos' o 'invitados' que no deberían poder acceder.
		if (usuario.estado !== 'activo') {
			return next(
				new AppError('Este usuario esta inactivo o suspendido', 403)
			) // 403 Forbidden
		}
		// 5. ¡ACCESO CONCEDIDO!
		// Adjuntamos el objeto del usuario (sin la contraseña) al objeto de la petición (req).
		// De esta forma, las siguientes funciones en la cadena de middlewares (los controladores)
		// tendrán acceso a la información del usuario que está haciendo la petición.
		// ADR-001: El objeto req.user ahora contiene el rol y el id_edificio.
		req.user = usuario
		// Pasamos al siguiente middleware o al controlador final.
		next()
	} catch (error) {
		// 'jwt.verify' lanza errores con nombres específicos que podemos usar para dar mensajes más claros.
		if (error.name === 'JsonWebTokenError') {
			return next(
				new AppError(
					'Token inválido. Por favor, inicia sesión de nuevo.',
					401
				)
			)
		}
		if (error.name === 'TokenExpiredError') {
			return next(
				new AppError(
					'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
					401
				)
			)
		}

		// Para cualquier otro error, lo pasamos al manejador global.
		next(error)
	}
}

/**
 * @description Middleware para verificar si el usuario tiene uno de los roles permitidos.
 * Se debe usar SIEMPRE DESPUÉS de protegerRuta.
 * @param {...string} rolesPermitidos - Una lista de strings con los roles que pueden acceder (ej. 'dueño_app', 'administrador').
 * @returns Para ser usado en una ruta.
 */
const verificaRol = (...rolesPermitidos) => {
	// esto devuelve otra funcion, aqui nos permite pasar argumentos ('rolesPermitidos) al midldleware
	return (req, res, next) => {
		// ADR-001: Verificamos el rol del usuario que fue adjuntado a 'req.user' por 'protegerRuta'.
		if (!req.user || !req.user.rol) {
			// Este error no debería ocurrir si los middlewares están en el orden correcto.
			// Es un error del servidor, no del cliente.
			return next(
				new AppError(
					'No se encontro informacion de rol para este usuario. Contacte a soporte',
					500
				)
			)
		}
		const rolUsuario = req.user.rol
		// Comprobamos si el rol del usuario está incluido en el array de roles permitidos.
		if (!rolesPermitidos.includes(rolUsuario)) {
			// 403 Forbidden: El servidor entiende la petición, pero se niega a autorizarla.
			// Es diferente de 401 Unauthorized (no estás autenticado).
			return next(
				new AppError(
					`Acceso denegado. Tu rol ('${rolUsuario}') no tiene permiso para acceder a este recurso.`,
					403
				)
			)
		}
		// Si el rol del usuario es uno de los permitidos, continuamos al siguiente middleware o controlador.
		next()
	}
}
module.exports = {
	protegeRuta,
	verificaRol
}
