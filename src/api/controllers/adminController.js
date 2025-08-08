const ExcelJS = require('exceljs');
const format = require('pg-format');
const db = require('../../config/db');
const AppError = require('../../utils/appError');
const tokenUtils = require('../../utils/tokenUtils');
const emailService = require('../../services/emailService');
const usuarioQueries = require('../../queries/usuarioQueries');
const unidadQueries = require('../../queries/unidadQueries');
const trabajoQueries = require('../../queries/trabajoQueries');

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
			message: `Se ha enviado un email de invitacion a ${nombreCompleto}, a la direccion de email ${email}`,
		});
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

/**
 * @description Procesa un archivo Excel para invitar masivamente a nuevos residentes.
 * Valida cada fila, omite las inválidas o duplicadas, crea los usuarios válidos
 * y encola los trabajos para el envío de emails de invitación en segundo plano.
 * @route POST /api/admin/invitaciones/residentes-masivo
 * @access Private (administrador)
 */
const invitarResidentesMasivo = async (req, res, next) => {
	try {
		// --- 1. CONFIGURACIÓN Y LECTURA INICIAL DEL ARCHIVO ---
		if (!req.file) {
			throw new AppError(
				'No se proporcionó ningún archivo para la carga masiva.',
				400
			);
		}

		const idEdificio = req.user.id_edificio_actual;
		const nombreEdificio = req.user.nombre_edificio;

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(req.file.buffer);
		const worksheet = workbook.getWorksheet(1);

		if (!worksheet || worksheet.rowCount <= 1) {
			throw new AppError(
				'El archivo Excel está vacío o no contiene filas de datos.',
				400
			);
		}

		// --- 2. EXTRACCIÓN Y PRE-PROCESAMIENTO DE DATOS DEL ARCHIVO ---
		const filasDelArchivo = [];
		worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
			if (rowNumber > 1) {
				// Saltamos la primera fila (encabezado).
				filasDelArchivo.push({
					numeroFila: rowNumber,
					nombre: (row.getCell(1).value || '').toString().trim(),
					apellido: (row.getCell(2).value || '').toString().trim(),
					email: (row.getCell(3).value || '').toString().trim(),
					telefono: (row.getCell(4).value || '').toString().trim(),
					cedula: (row.getCell(5).value || '').toString().trim(),
					nombreUnidad: (row.getCell(6).value || '')
						.toString()
						.trim()
						.toLowerCase(),
					nombreUnidadOriginal: (row.getCell(6).value || '')
						.toString()
						.trim(),
				});
			}
		});

		if (filasDelArchivo.length === 0) {
			throw new AppError(
				'No se encontraron filas con datos en el archivo.',
				400
			);
		}

		// --- 3. VALIDACIÓN CRUZADA CON LA BASE DE DATOS (EFICIENTE) ---
		const emailsAValidar = filasDelArchivo
			.map((f) => f.email)
			.filter(Boolean);
		const cedulasAValidar = filasDelArchivo
			.map((f) => f.cedula)
			.filter(Boolean);

		// Hacemos una única consulta para traer todas las unidades y usuarios existentes.
		const [unidadesResult, usuariosExistentesResult] = await Promise.all([
			db.query(unidadQueries.OBTENER_UNIDADES_POR_EDIFICIO, [idEdificio]),
			db.query(
				usuarioQueries.GET_USUARIOS_EXISTENTES_POR_EMAIL_O_CEDULA,
				[emailsAValidar, cedulasAValidar]
			),
		]);

		const unidadesMap = new Map(
			unidadesResult.rows.map((u) => [
				u.numero_unidad.toLowerCase(),
				u.id,
			])
		);
		const emailsExistentesSet = new Set(
			usuariosExistentesResult.rows.map((u) => u.email)
		);
		const cedulasExistentesSet = new Set(
			usuariosExistentesResult.rows.map((u) => u.cedula).filter(Boolean)
		);

		// --- 4. PROCESAMIENTO Y VALIDACIÓN FINAL, FILA POR FILA ---
		const usuariosParaInvitar = [];
		const erroresDeValidacion = [];

		for (const fila of filasDelArchivo) {
			if (!fila.nombre ||!fila.apellido || !fila.email || !fila.nombreUnidad) {
				erroresDeValidacion.push({
					fila: fila.numeroFila,
					error: 'Faltan datos obligatorios (Nombre, Apellido, Email o Unidad).',
				});
			} else if (emailsExistentesSet.has(fila.email)) {
				erroresDeValidacion.push({
					fila: fila.numeroFila,
					error: `El email '${fila.email}' ya está registrado.`,
				});
			} else if (fila.cedula && cedulasExistentesSet.has(fila.cedula)) {
				erroresDeValidacion.push({
					fila: fila.numeroFila,
					error: `La cédula '${fila.cedula}' ya está registrada.`,
				});
			} else if (!unidadesMap.has(fila.nombreUnidad)) {
				erroresDeValidacion.push({
					fila: fila.numeroFila,
					error: `La unidad '${fila.nombreUnidadOriginal}' no existe.`,
				});
			} else {
				fila.idUnidad = unidadesMap.get(fila.nombreUnidad);
				usuariosParaInvitar.push(fila);
				// Evitamos que un email/cédula válido se procese dos veces si está duplicado en el mismo archivo.
				if (fila.email) emailsExistentesSet.add(fila.email);
				if (fila.cedula) cedulasExistentesSet.add(fila.cedula);
			}
		}
		console.log({usuariosParaInvitar});
		

		// --- 5. EJECUCIÓN DE OPERACIONES EN BD (SI HAY USUARIOS VÁLIDOS) ---
		if (usuariosParaInvitar.length > 0) {
			const cliente = await db.getClient();
			try {
				await cliente.query('BEGIN');

				const usuariosParaInsertarDB = [];
				const trabajosParaEncolar = [];

				for (const usuario of usuariosParaInvitar) {
					const { tokenPlano, tokenHasheado } = tokenUtils.generaTokenRegistro()
					const tokenExpira = new Date(
						Date.now() + 72 * 60 * 60 * 1000
					);

					usuariosParaInsertarDB.push([
						usuario.nombre,
						usuario.apellido,
						usuario.email,
						usuario.telefono,
						usuario.cedula|| null,
						idEdificio,
						tokenHasheado,
						tokenExpira,
						'residente',
						usuario.idUnidad,
						'invitado',
					]);

					const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;

					const payloadEmail = {
						destinatarioEmail: usuario.email,
						destinatarioNombre: nombreCompleto,
						token: tokenPlano,
						nombreEdificio,
					};
					trabajosParaEncolar.push([
						'enviar_email_invitacion_residente',
						JSON.stringify(payloadEmail),
					]);
				}

				const sqlUsuarios = format(
					usuarioQueries.CREA_USUARIOS_MASIVO,
					usuariosParaInsertarDB
				);
				await cliente.query(sqlUsuarios);

				const sqlTrabajos = format(
					trabajoQueries.CREA_TRABAJOS_MASIVO,
					trabajosParaEncolar
				);
				await cliente.query(sqlTrabajos);

				await cliente.query('COMMIT');
			} catch (error) {
				await cliente.query('ROLLBACK');
				throw error;
			} finally {
				cliente.release();
			}
		}

		// --- 6. RESPUESTA FINAL AL ADMINISTRADOR ---
		res.status(200).json({
			success: true,
			message: 'Proceso de carga masiva finalizado.',
			data: {
				invitacionesEncoladas: usuariosParaInvitar.length,
				invitacionesFallidas: erroresDeValidacion.length,
				errores: erroresDeValidacion,
			},
		});
	} catch (error) {
		next(error);
	}
};
module.exports = {
	invitarResidente,
	invitarResidentesMasivo,
};
