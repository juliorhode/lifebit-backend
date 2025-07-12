/**
 * @description Endpoint de prueba para obtener datos del dashboard del Dueño.
 * Demuestra que el usuario ha sido autenticado y autorizado.
 * @route GET /api/dueño/dashboard
 * @access Private (Rol: dueño_app)
 */
const getDashboard = (req, res, next) => {
	// Aqui ya sabemos que req.user existe y tiene el rol correcto 'dueño_app'
	// porque este middleware se ejecuta DESPUES de 'protegerRuta' y 'verificaRol'.
	res.status(200).json({
		success: true,
		message: `Acceso concedido al dashboard secreto de ${req.user.nombre}`,
		data: {
			rolDelUsuario: req.user.rol,
			datosSimulado: {
				nuevasSolicitudes: 3,
				pagosDeLicenciasPorVerificar: 7,
				contratosPorVencer: 2,
			},
		},
	})
}
module.exports = { getDashboard }
