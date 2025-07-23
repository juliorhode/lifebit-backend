const jwt = require('jsonwebtoken')
/**
 * @description Genera un par de tokens (acceso y refresco) para un usuario.
 * @param {object} payload - El objeto que se incluirá en el token (debe contener id y rol del usuario).
 * @returns {object} Un objeto con accessToken y refreshToken.
 */
// El payload es la información que "viaja" dentro del token. El id y el rol del usuario nos permitirán identificar al usuario y sus permisos en futuras peticiones.
const generaTokens = (payload) => {
	// 1. Firmamos el token de ACCESO.
	// Usa el secreto principal y una vida corta.
	const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	})
	// 2. Firmamos el token de REFRESCO.
	// Usa un secreto DIFERENTE y una vida larga.
	const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
		expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
	})
	// 3. Devolvemos ambos tokens.
	return { accessToken, refreshToken }
}

module.exports = generaTokens
