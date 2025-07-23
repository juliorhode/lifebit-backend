const db = require('../../config/db');
const AppError = require('../../utils/appError');

const tokenUtils = require('../../utils/tokenUtils');
const emailService = require('../../services/emailService');

// Importamos todos los archivos de queries que necesitaremos
const solicitudQueries = require('../../queries/solicitudQueries');
const contratoQueries = require('../../queries/contratoQueries');
const edificioQueries = require('../../queries/edificioQueries');
const usuarioQueries = require('../../queries/usuarioQueries');

/**
 * @description Obtiene una lista de todas las solicitudes de servicio pendientes.
 * @route GET /api/owner/solicitudes
 * @access Private (dueño_app)
 */
const obtenerSolicitudesPendientes = async (req, res, next) => {
	try {
		// Ejecutamos la consulta para obtener las solicitudes.
		const { rows: solicitudes } = await db.query(
			solicitudQueries.OBTENER_SOLICITUDES_PENDIENTES
		);
		// No es un error si no hay solicitudes, simplemente devolvemos un array vacío.
		// El frontend se encargará de mostrar un mensaje.
		res.status(200).json({
			success: true,
			count: solicitudes.length,
			data: {
				solicitudes,
			},
		});
	} catch (error) {
		// Pasamos cualquier error inesperado al manejador global.
		next(error);
	}
};

/**
 * @description Aprueba una solicitud, creando un contrato, edificio, y un usuario administrador invitado.
 * @route POST /api/owner/solicitudes/:id/aprobar
 */
const aprobarSolicitud = async (req, res, next) => {
	const cliente = await db.getClient();
	try {
		// 1. Iniciar la transacción
		await cliente.query('BEGIN');
		// Obtenemos el id de la solicitud
		const { id: idSolicitud } = req.params;

		// 2. Obtener la solicitud y verificar que está pendiente.
		const {
			rows: [solicitud],
		} = await cliente.query(solicitudQueries.OBTENER_SOLICITD_POR_ID, [
			idSolicitud,
		]);

		if (!solicitud) {
			throw new AppError(
				'La solicitud no existe o ya ha sido procesada',
				404
			);
		}
		// 3. Crear el Contrato en periodo de prueba.
		const fechaFinPrueba = new Date();
		// Añadimos 30 días de prueba.
		fechaFinPrueba.setDate(fechaFinPrueba.getDate() + 30);

		// Aquí necesitaríamos el monto mensual de la licencia, por ahora usaremos un valor fijo.
		// ADR-003: La lógica para obtener el monto de la licencia se refinará.
		const montoFijo = 50.0;
		const contratoResult = await cliente.query(
			contratoQueries.REGISTRA_CONTRATO_PRUEBA,
			[solicitud.id, fechaFinPrueba, montoFijo]
		);
		const idContrato = contratoResult.rows[0].id;

		// 4. Crear el Edificio.
		const edificioResult = await cliente.query(
			edificioQueries.CREA_EDIFICIO,
			[
				solicitud.nombre_edificio,
				solicitud.direccion_edificio,
				idContrato,
			]
		);
		const idEdificio = edificioResult.rows[0].id;

		// 5. Generar el token de invitación para el nuevo administrador.
		const { tokenPlano, tokenHasheado } = tokenUtils.generaTokenRegistro();
		const tokenExpira = new Date(Date.now + 24 * 60 * 60 * 1000); // Token válido por 24 horas.

		// 6. Crear el Usuario administrador en estado 'invitado'.
		const valoresUsuario = [
			solicitud.nombre_solicitante,
			solicitud.apellido_solicitante,
			solicitud.email_solicitante,
			solicitud.telefono_solicitante,
			solicitud.cedula_solicitante,
			idEdificio,
			tokenHasheado,
			tokenExpira,
		];
		await cliente.query(
			usuarioQueries.CREA_USUARIO_INVITADO,
			valoresUsuario
		);
		// 7. Actualizar el estado de la solicitud a 'aprobado'.
		await cliente.query(solicitudQueries.ACTUALIZA_SOLICITUD_ESTADO, [
			idSolicitud,
		]);
		// 8. Enviar el email de invitación (solo si todo lo anterior tuvo éxito).
		await emailService.enviarEmailInvitacion(
			solicitud.email_solicitante,
			solicitud.nombre_solicitante,
			tokenPlano
		);
		// 9. Si todo fue exitoso, confirmar la transacción.
		await cliente.query('COMMIT');

		res.status(200).json({
			success: true,
			message: `Solicitud ${idSolicitud} aprobada exitosamente. Se ha enviado un email de invitacion a ${solicitud.email_solicitante}`,
		});
	} catch (error) {
		// Si algo falla, revertir todos los cambios.
		await cliente.query('ROLLBACK');
		next(error);
	} finally {
		cliente.release();
	}
};

module.exports = {
	obtenerSolicitudesPendientes,
	aprobarSolicitud,
};
