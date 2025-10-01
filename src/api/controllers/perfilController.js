





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