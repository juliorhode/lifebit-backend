const { validarContraseña } = require('../utils/validationUtils');
const AppError = require('../utils/appError');

/**
 * @description Un middleware de Express para validar la fortaleza de una contraseña
 *              enviada en el cuerpo de la petición (`req.body`).
 * 
 * Este middleware busca una propiedad `contraseña` o `nuevaContraseña` en `req.body`.
 * Si la encuentra, la valida usando nuestra política de seguridad.
 * Si la validación falla, detiene la cadena de middlewares y envía un error 400.
 * Si la validación tiene éxito, pasa el control al siguiente middleware o controlador.
 * 
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 * @param {Function} next - La función para pasar el control al siguiente middleware.
 */
const middlewareValidarContraseña = (req, res, next) => {
	// Buscamos la contraseña en `req.body`. Le damos prioridad a `nuevaContraseña` si existe,
	// que es el caso de `updatePassword`, de lo contrario usamos `contraseña`.
	const contraseña = req.body.nuevaContraseña || req.body.contraseña;

	// Si no hay ninguna contraseña en el body, no es responsabilidad de este middleware
	// fallar. Simplemente pasamos el control. Otro validador o el propio controlador
	// se quejará si la contraseña era requerida.
	if (!contraseña) {
		// Podríamos lanzar un error aquí, pero es más limpio y modular dejar que
		// el controlador se queje de los campos faltantes.
		// Por ejemplo, en resetPassword, ya verificamos `!token || !contraseña`.
		return next();
	}

	// Usamos nuestra herramienta de utilidad para realizar la validación.
	const validacion = validarContraseña(contraseña);

	// Si la validación falla, detenemos todo y enviamos el error.
	if (!validacion.esValido) {
		return next(new AppError(validacion.mensaje, 400));
	}

	// Si la contraseña es válida, todo sigue su curso normal.
	next();
};
module.exports = { middlewareValidarContraseña };