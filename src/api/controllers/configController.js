const db = require('../../config/db');
const AppError = require('../../utils/appError');
const edificioQueries = require('../../queries/edificioQueries');
const {
	ESTADOS_CONFIGURACION,
	ORDEN_CONFIGURACION,
} = require('../../config/constantes');

/**
 * @description Avanza el estado de configuración del edificio del administrador al siguiente paso.
 * @route POST /api/admin/configuracion/avanzar-paso
 * @access Private (administrador)
 */
const avanzarPasoConfiguracion = async (req, res, next) => {
	try {
		const idEdificio = req.user.id_edificio_actual;
		const estadoActual = req.user.estado_configuracion;
		// Buscamos el índice del estado actual en nuestro array de orden.
		const indiceActual = ORDEN_CONFIGURACION.indexOf(estadoActual);
		// Determinamos cuál es el siguiente estado.
		// Si ya está en el último paso, no hacemos nada.
		if (indiceActual >= ORDEN_CONFIGURACION.length - 1) {
			throw new AppError('La configuración ya ha sido completada.', 400);
		}
		const siguienteEstado = ORDEN_CONFIGURACION[indiceActual + 1];
		// Ejecutamos la actualización en la base de datos.
		await db.query(edificioQueries.ACTUALIZA_ESTADO_CONFIGURACION, [
			siguienteEstado,
			idEdificio,
		]);
		res.status(200).json({
			success: true,
			messge: `Paso de configuracion avanzado a: ${siguienteEstado}`,
			data: {
				nuevoEstado: siguienteEstado,
			},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	avanzarPasoConfiguracion,
};
