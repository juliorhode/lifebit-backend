const db = require('../../config/db');
const AppError = require('../../utils/appError');
const usuarioQueries = require('../../queries/usuarioQueries');

/**
 * @description Obtiene el perfil completo del usuario actualmente autenticado.
 * @route GET /api/perfil/me
 * @access Private (requiere token)
 */
const obtenerPerfil = (req, res, next) => {
	// La información del usuario ya fue cargada por el middleware 'protegeRuta'.
	// No necesitamos buscarlo en la base de datos de nuevo aquí.
	res.status(200).json({
		success: true,
		data: {
			user: req.user,
		},
	});
};

/**
 * @description Desvincula la cuenta de Google del usuario actualmente autenticado.
 * Impone la regla de negocio de que un usuario no puede desvincular Google
 * si no tiene una contraseña de LifeBit establecida.
 * @route POST /api/perfil/google/desvincular
 * @access Private
 */
const desvinculaGoogle = async (req, res, next) => {
	try {
		// 1. OBTENER IDENTIDAD SEGURA
		// La identidad del usuario (su ID) se obtiene del token procesado por 'protegeRuta'.
		const idUsuario = req.user.id;

		// 2. OBTENER ESTADO ACTUAL DEL USUARIO
		// Hacemos una consulta a la BD para obtener el registro completo y más reciente del usuario.
		// Esto es crucial para verificar el estado de las columnas 'google_id' y 'contraseña'.
		const {
			rows: [usuario],
		} = await db.query(usuarioQueries.OBTENER_USUARIO_POR_ID, [idUsuario]);

		// 3. VALIDACIONES DE NEGOCIO Y SEGURIDAD
		// Verificamos si la cuenta ya está desvinculada para evitar operaciones innecesarias.
		if (!usuario.google_id) {
			throw new AppError('Tu cuenta no está actualmente vinculada a Google.', 400);
		}

		// La regla de negocio más importante: No permitir que un usuario se quede "encerrado".
		if (!usuario.contraseña) {
			throw new AppError(
				'No puedes desvincular tu cuenta de Google porque no tienes una contraseña de LifeBit establecida. Por favor, utiliza la opción "Establecer Contraseña" primero.',
				403 // 403 Forbidden: Acción prohibida por una regla de negocio.
			);
		}

		// 4. EJECUTAR LA ACCIÓN
		// Si todas las validaciones pasan, procedemos a actualizar la base de datos.
		await db.query(usuarioQueries.DESVINCULAR_GOOGLE_ID, [idUsuario]);

		// 5. RESPUESTA EXITOSA
		res.status(200).json({
			success: true,
			message:
				'Tu cuenta de Google ha sido desvinculada exitosamente. A partir de ahora, solo podrás iniciar sesión con tu email y contraseña.',
		});
	} catch (error) {
		// Pasamos cualquier error inesperado al manejador global.
		next(error);
	}
};

module.exports = {
	obtenerPerfil,
	desvinculaGoogle,
};
