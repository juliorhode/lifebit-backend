const db = require('../../config/db');
const AppError = require('../../utils/appError');
const tokenUtils = require('../../utils/tokenUtils');
const emailService = require('../../services/emailService');
const usuarioQueries = require('../../queries/usuarioQueries');
const unidadQueries = require('../../queries/unidadQueries');

/**
 * @description Invita a un nuevo residente al edificio del administrador, asociándolo a una unidad.
 * @route POST /api/admin/residentes/invitar
 * @access Private (administrador)
 */
const invitarResidente = async (req, res, next) => {
	// Obtenemos un cliente para la transacción.
	const cliente = await db.getClient();
	try {
		// --- 1. EXTRACCIÓN Y VALIDACIÓN DE DATOS ---
		const { nombre, apellido, email, telefono, cedula, idUnidad } =
			req.body;
		// Obtenemos los datos del administrador desde el middleware 'protegeRuta'.
		const idEdificio = req.user.id_edificio_actual;
		const nombreEdificio = req.user.nombre_edificio;

		// Validamos la presencia de los datos minimos obligatorios
		if (!nombre || !apellido || !email || !idUnidad) {
			throw new AppError(
				'El nombre, apellido, email y la unidad del residente son obligatorios.',
				400
			);
		}
		// Iniciamos la transacción.
		await cliente.query('BEGIN');
		// --- 2. VALIDACIÓN DE SEGURIDAD ---
		// Verificamos que la unidad (idUnidad) realmente pertenezca al edificio del administrador.
		const {
			rows: [unidad],
		} = await cliente.query(
			unidadQueries.OBTENER_UNIDAD_POR_ID_Y_EDIFICIO,
			[idUnidad, idEdificio]
		);
		if (!unidad) {
			throw new AppError(
				`La unidad con ID ${idUnidad} no exite o no pertenece a tu edificio.`,
				404
			);
		}
		// --- 3. LÓGICA DE INVITACIÓN ---
		const { tokenPlano, tokenHasheado } = tokenUtils.generaTokenRegistro();
		const tokenExpira = new Date(Date.now() + 72 * 60 * 60 * 1000); // Token válido por 72 horas (3 días).
		const valoresUsuario = [
			nombre,
			apellido,
			email,
			telefono,
			cedula,
			idEdificio,
			tokenHasheado,
			tokenExpira,
			'residente', // Asignamos el rol 'residente'.
			idUnidad, // Asociamos al usuario con su unidad.
		];
		await cliente.query(
			usuarioQueries.CREA_USUARIO_INVITADO,
			valoresUsuario
		);
		// Enviamos el email de invitación, pasando el nombre del edificio.
		const nombreCompleto = `${nombre} ${apellido}`;
		await emailService.enviarEmailInvitacionResidente(
			email,
			nombreCompleto,
			tokenPlano,
			nombreEdificio
		);
        // Si todo ha ido bien, confirmamos la transacción.
        await cliente.query('COMMIT');

        res.status(200).json({
            success: true,
            message:`Se ha enviado un email de invitacion a ${nombreCompleto}, a la direccion de email ${email}`
        })

    } catch (error) {
        // Si algo falla, revertimos todos los cambios.
        await cliente.query('ROLLBACK');
        if (error.code === '23505') {
			// unique_violation
			return next(
				new AppError(
					`El email '${req.body.email}' o la cédula ya están registrados en la plataforma.`,
					409
				)
			);
		}
        next(error);
    } finally {
        cliente.release();
    }
};

module.exports = {
	invitarResidente,
};