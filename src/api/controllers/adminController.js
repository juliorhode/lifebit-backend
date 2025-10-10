const ExcelJS = require('exceljs');
const format = require('pg-format');
const db = require('../../config/db');
const AppError = require('../../utils/appError');
const tokenUtils = require('../../utils/tokenUtils');
const emailService = require('../../services/emailService');
const usuarioQueries = require('../../queries/usuarioQueries');
const unidadQueries = require('../../queries/unidadQueries');
const trabajoQueries = require('../../queries/trabajoQueries');
const residenteQueries = require('../../queries/residenteQueries');

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
		const { nombre, apellido, email, telefono, cedula, idUnidad } = req.body;
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
		} = await cliente.query(unidadQueries.OBTENER_UNIDAD_POR_ID_Y_EDIFICIO, [
			idUnidad,
			idEdificio,
		]);
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
		await cliente.query(usuarioQueries.CREA_USUARIO_INVITADO, valoresUsuario);
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
			throw new AppError('No se proporcionó ningún archivo para la carga masiva.', 400);
		}

		const idEdificio = req.user.id_edificio_actual;
		const nombreEdificio = req.user.nombre_edificio;

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(req.file.buffer);
		const worksheet = workbook.getWorksheet(1);

		if (!worksheet || worksheet.rowCount <= 1) {
			throw new AppError('El archivo Excel está vacío o no contiene filas de datos.', 400);
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
					nombreUnidad: (row.getCell(6).value || '').toString().trim().toLowerCase(),
					nombreUnidadOriginal: (row.getCell(6).value || '').toString().trim(),
				});
			}
		});

		if (filasDelArchivo.length === 0) {
			throw new AppError('No se encontraron filas con datos en el archivo.', 400);
		}

		// --- 3. VALIDACIÓN CRUZADA CON LA BASE DE DATOS (EFICIENTE) ---
		const emailsAValidar = filasDelArchivo.map((f) => f.email).filter(Boolean);
		const cedulasAValidar = filasDelArchivo.map((f) => f.cedula).filter(Boolean);

		// Hacemos una única consulta para traer todas las unidades y usuarios existentes.
		const [unidadesResult, usuariosExistentesResult] = await Promise.all([
			db.query(unidadQueries.OBTENER_UNIDADES_POR_EDIFICIO, [idEdificio]),
			db.query(usuarioQueries.GET_USUARIOS_EXISTENTES_POR_EMAIL_O_CEDULA, [
				emailsAValidar,
				cedulasAValidar,
			]),
		]);

		const unidadesMap = new Map(
			unidadesResult.rows.map((u) => [u.numero_unidad.toLowerCase(), u.id])
		);
		const emailsExistentesSet = new Set(usuariosExistentesResult.rows.map((u) => u.email));
		const cedulasExistentesSet = new Set(
			usuariosExistentesResult.rows.map((u) => u.cedula).filter(Boolean)
		);

		// --- 4. PROCESAMIENTO Y VALIDACIÓN FINAL, FILA POR FILA ---
		const usuariosParaInvitar = [];
		const erroresDeValidacion = [];

		for (const fila of filasDelArchivo) {
			if (!fila.nombre || !fila.apellido || !fila.email || !fila.nombreUnidad) {
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
		console.log({ usuariosParaInvitar });

		// --- 5. EJECUCIÓN DE OPERACIONES EN BD (SI HAY USUARIOS VÁLIDOS) ---
		if (usuariosParaInvitar.length > 0) {
			const cliente = await db.getClient();
			try {
				await cliente.query('BEGIN');

				const usuariosParaInsertarDB = [];
				const trabajosParaEncolar = [];

				for (const usuario of usuariosParaInvitar) {
					const { tokenPlano, tokenHasheado } = tokenUtils.generaTokenRegistro();
					const tokenExpira = new Date(Date.now() + 72 * 60 * 60 * 1000);

					usuariosParaInsertarDB.push([
						usuario.nombre,
						usuario.apellido,
						usuario.email,
						usuario.telefono,
						usuario.cedula || null,
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

/**
 * @description Obtiene una lista completa de los residentes del edificio del administrador.
 * @route GET /api/admin/residentes
 * @access Private (administrador)
 */
const obtenerResidentes = async (req, res, next) => {
	try {
		// Obtenemos el ID del edificio desde el token del administrador
		const idEdificio = req.user.id_edificio_actual;
		// Validamos que esté asociado al edificio
		if (!idEdificio) {
			throw new AppError('El administrador no esta asociado a este edificio.', 400);
		}
		// Ejecutamos la query para obtener la lista de residentes
		const { rows: residentes } = await db.query(
			residenteQueries.OBTENER_RESIDENTES_POR_EDIFICIO,
			[idEdificio]
		);

		// Devolvemos el listado de residentes (el Array puede estar vacio, no es un error)
		res.status(200).json({
			success: true,
			data: residentes,
		});
	} catch (error) {
		next(error);
	}
};
/**
 * @description Actualiza la información de un residente específico. Permite modificar
 * datos personales, el estado, y asignar/reasignar/desasignar su unidad.
 * @route PATCH /api/admin/residentes/:id
 * @access Private (administrador)
 */
const actualizaResidente = async (req, res, next) => {
	try {
		// --- 1. EXTRACCIÓN INICIAL DE DATOS ---
		const { id: idResidente } = req.params; // ID del residente a modificar (de la URL).
		const idEdificio = req.user.id_edificio_actual; // ID del edificio del admin (del token).

		// --- 2. VALIDACIÓN DE PROPIEDAD (SEGURIDAD) ---
		// Se realiza una consulta inicial para dos propósitos:
		// a) Verificar que el residente existe y pertenece al edificio del administrador.
		// b) Obtener el estado actual del residente para usarlo como valor por defecto.
		const {
			rows: [residenteActual],
		} = await db.query(residenteQueries.OBTENER_RESIDENTE_POR_ID_Y_EDIFICIO, [
			idResidente,
			idEdificio,
		]);

		if (!residenteActual) {
			throw new AppError(
				`El residente con ID ${idResidente} no existe o no pertenece a tu edificio.`,
				404
			);
		}

		// --- 3. PROCESAMIENTO DEL CAMBIO DE UNIDAD ---
		const { numeroUnidad } = req.body;
		let idUnidadFinal = residenteActual.id_unidad_actual; // Por defecto, la unidad no cambia.

		// Esta lógica solo se ejecuta si el campo 'numeroUnidad' fue enviado en el body.
		if (numeroUnidad !== undefined) {
			if (numeroUnidad === null || numeroUnidad === '') {
				// CASO 1: Desasignar al residente de cualquier unidad.
				idUnidadFinal = null;
			} else {
				// CASO 2: Asignar o reasignar a una nueva unidad.
				// Validación A: La nueva unidad debe existir en el edificio.
				const {
					rows: [unidadEncontrada],
				} = await db.query(unidadQueries.OBTENER_UNIDAD_POR_NOMBRE_Y_EDIFICIO, [
					numeroUnidad,
					idEdificio,
				]);
				if (!unidadEncontrada) {
					throw new AppError(
						`La unidad con el nombre "${numeroUnidad}" no existe en tu edificio.`,
						404
					);
				}

				// Validación B: La nueva unidad debe estar disponible (no ocupada por OTRO residente).
				const { rowCount } = await db.query(
					unidadQueries.OBTENER_DISPONIBILIDAD_UNIDAD,
					[unidadEncontrada.id, idResidente]
				);
				if (rowCount > 0) {
					throw new AppError(
						`La unidad "${numeroUnidad}" ya está ocupada por otro residente.`,
						409
					); // 409 Conflict
				}

				// Si todas las validaciones pasan, la nueva unidad es válida.
				idUnidadFinal = unidadEncontrada.id;
			}
		}

		// --- 4. PREPARACIÓN DE DATOS PARA EL UPDATE ---
		// Se construye un objeto con los datos finales. Si un campo no viene en el body,
		// se utiliza el valor actual de la base de datos como fallback.
		const datosParaActualizar = {
			nombre: req.body.nombre || residenteActual.nombre,
			apellido: req.body.apellido || residenteActual.apellido,
			email: req.body.email || residenteActual.email,
			telefono:
				req.body.telefono === undefined ? residenteActual.telefono : req.body.telefono, // Permite poner el teléfono en blanco
			cedula: req.body.cedula === undefined ? residenteActual.cedula : req.body.cedula,
			estado: req.body.estado || residenteActual.estado,
			id_unidad_actual: idUnidadFinal,
		};

		// --- 5. EJECUCIÓN DE LA ACTUALIZACIÓN ---
		const valores = [
			datosParaActualizar.nombre,
			datosParaActualizar.apellido,
			datosParaActualizar.email,
			datosParaActualizar.telefono,
			datosParaActualizar.cedula,
			datosParaActualizar.estado,
			datosParaActualizar.id_unidad_actual,
			idResidente,
		];

		const {
			rows: [residenteActualizado],
		} = await db.query(residenteQueries.ACTUALIZAR_RESIDENTE, valores);

		// --- 6. RESPUESTA EXITOSA ---
		res.status(200).json({
			success: true,
			message: 'La información del residente ha sido actualizada exitosamente.',
			data: {
				residente: residenteActualizado,
			},
		});
	} catch (error) {
		// Manejamos errores de unicidad si se intenta poner un email o cédula que ya existen.
		if (error.code === '23505') {
			return next(
				new AppError(
					'El email o la cédula proporcionados ya están en uso por otro usuario.',
					409
				)
			);
		}
		// Pasamos cualquier otro error a nuestro manejador central.
		next(error);
	}
};
/**
 * @description "Elimina" (suspende) a un residente del edificio.
 * @route DELETE /api/admin/residentes/:id
 * @access Private (administrador)
 */
const eliminarResidente = async (req, res, next) => {
	try {
		const { id: idResidente } = req.params;
		const idEdificio = req.user.id_edificio_actual;

		// 1. VERIFICACIÓN DE PROPIEDAD: Primero, nos aseguramos de que el residente a eliminar existe
		// y pertenece al edificio del administrador. Reutilizamos la query de 'actualizar'.
		const { rowCount } = await db.query(residenteQueries.OBTENER_RESIDENTE_POR_ID_Y_EDIFICIO, [
			idResidente,
			idEdificio,
		]);

		if (rowCount === 0) {
			throw new AppError(
				`El residente con ID ${idResidente} no existe o no pertenece a tu edificio.`,
				404
			);
		}

		// 2. EJECUCIÓN DEL BORRADO BLANDO
		const {
			rows: [residenteSuspendido],
		} = await db.query(residenteQueries.SUSPENDER_RESIDENTE, [idResidente]);

		// 3. RESPUESTA
		// El código de estado 204 (No Content) es ideal para un DELETE exitoso,
		// pero como queremos enviar un mensaje, usamos 200 OK.
		const nombreCompleto = `${residenteSuspendido.nombre} ${residenteSuspendido.apellido}`;
		res.status(200).json({
			success: true,
			message: `El residente "${nombreCompleto}" ha sido suspendido y su acceso a la plataforma ha sido revocado.`,
		});
	} catch (error) {
		next(error);
	}
}

const obtenerCaracteristicasEdificio = async (req, res, next) => {
	try {
		const { rows } = await db.query(
			`
      SELECT l.caracteristicas
      FROM licencias l
      JOIN contratos c ON l.id = c.id_licencia
      JOIN edificios e ON c.id = e.id_contrato
      WHERE e.id = $1
    `,
			[req.user.id_edificio_actual]
		);

		if (!rows.length)
			return next(new AppError('No se encontraron características para este edificio.', 404));

		return res.json({ success: true, data: rows[0].caracteristicas });
	} catch (error) {
		return next(error);
	}
};
module.exports = {
	invitarResidente,
	invitarResidentesMasivo,
	obtenerResidentes,
	actualizaResidente,
	eliminarResidente,
	obtenerCaracteristicasEdificio,
};
