const db = require('../../config/db');
const AppError = require('../../utils/appError');
const recursoQueries = require('../../queries/recursoQueries');
const unidadQueries = require('../../queries/unidadQueries');
const format = require('pg-format');
const ExcelJS = require('exceljs');

/**
 * @description Crea un nuevo tipo de recurso para el edificio del administrador.
 * @route POST /api/admin/recursos/tipos
 * @access Private (administrador)
 */
const crearTipoRecurso = async (req, res, next) => {
	try {
		// --- 1. EXTRACCIÓN Y VALIDACIÓN DE DATOS ---

		// Obtenemos el nombre y el tipo del recurso desde el cuerpo de la petición.
		const { nombre, tipo } = req.body;
		// Obtenemos el ID del edificio DESDE el objeto 'req.user'.
		// Este objeto fue añadido por nuestro middleware 'protegeRuta' y es SEGURO.
		// NUNCA confiamos en un id de edificio que venga del req.body por temas de seguridad (el idEdificio que usamos es el que está "sellado" en su token de sesión).
		const idEdificio = req.user.id_edificio_actual;
		// Validamos que los datos necesarios estén presentes.
		if (!nombre || !tipo) {
			throw new AppError(
				'El nombre y el tipo de recurso son obligatorios.',
				400
			);
		}

		// Validamos que el 'tipo' sea uno de los valores permitidos por la base de datos.
		// Esto nos da un mensaje de error más claro que el error genérico de la BD.
		const tiposValidos = ['asignable', 'inventario'];
		if (!tiposValidos.includes(tipo)) {
			throw new AppError(
				`El tipo de recurso "${tipo}" no es válido. Use "asignable" o "inventario".`,
				400
			);
		}

		if (!idEdificio) {
			throw new AppError(
				'El administrador no está asociado a ningún edificio.',
				400
			);
		}

		// --- 2. INSERCIÓN EN LA BASE DE DATOS ---
		// Preparamos los valores para la inserción.
		const valores = [nombre, tipo, idEdificio];
		// Ejecutamos la query para insertar el nuevo tipo de recurso.
		const {
			rows: [nuevoTipoRecurso],
		} = await db.query(recursoQueries.CREA_TIPO_RECURSO, valores);

		// --- 3. RESPUESTA EXITOSA ---
		res.status(201).json({
			success: true,
			message: 'Tipo de recurso creado exitosamente.',
			data: {
				recurso: nuevoTipoRecurso,
			},
		});
	} catch (error) {
		// Manejamos el error de unicidad si ya existe un recurso con ese nombre en ese edificio.
		// El schema no tiene esta restricción, pero se debe corregir.
		// ADR-005: Añadir UNIQUE(id_edificio, nombre) a la tabla recursos_edificio.
		if (error.code === '23505') {
			return next(
				new AppError(
					`Ya existe un tipo de recurso el nombre ${req.body.nombre} para este edificio.`,
					409
				)
			);
		}
		next(error);
	}
};

/**
 * @description Obtiene los tipo de recurso para el edificio del administrador.
 * @route GET /api/admin/recursos/tipos
 * @access Private (administrador)
 */
const obtenerTiposRecurso = async (req, res, next) => {
	try {
		// Obtenemos el ID del edificio DESDE el objeto 'req.user'.
		const idEdificio = req.user.id_edificio_actual;
		if (!idEdificio) {
			throw new AppError(
				'El administrador no está asociado a ningún edificio.',
				400
			);
		}
		// Ejecutamos la query para obtener los tipos de recurso.
		const { rows: tiposRecurso } = await db.query(
			recursoQueries.OBTENER_TIPOS_RECURSO_POR_EDIFICIO,
			[idEdificio]
		);
		// No es un error si no hay recursos, simplemente devolvemos un array vacío.
		// El frontend se encargará de mostrar un mensaje.
		res.status(200).json({
			success: true,
			count: tiposRecurso.length,
			data: {
				tiposRecurso,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @description Actualiza un tipo de recurso existente.
 * @route PATCH /api/admin/recursos/tipos/:id
 * @access Private (administrador)
 */
const actualizarTipoRecurso = async (req, res, next) => {
	try {
		// Obtenemos el ID del recurso a actualizar desde los parámetros de la URL.
		const { id: idRecurso } = req.params;
		// Obtenemos los nuevos datos desde el cuerpo de la petición.
		const { nombre, tipo } = req.body;
		// Obtenemos el ID del edificio desde el usuario autenticado para seguridad.
		const idEdificio = req.user.id_edificio_actual;
		// Validamos que al menos uno de los campos a actualizar esté presente.
		if (!nombre || !tipo) {
			throw new AppError(
				'Debe proporcionar los campos (nombre o tipo) para actualizar.',
				400
			);
		}
		// Validamos que el 'tipo' sea uno de los valores permitidos por la base de datos.
		// Esto nos da un mensaje de error más claro que el error genérico de la BD.
		const tiposValidos = ['asignable', 'inventario'];
		if (!tiposValidos.includes(tipo)) {
			throw new AppError(
				`El tipo de recurso "${tipo}" no es válido. Use "asignable" o "inventario".`,
				400
			);
		}
		// Preparamos los valores para la query de actualización.
		const valores = [nombre, tipo, idRecurso, idEdificio];
		// Ejecutamos la query. RETURNING * nos devuelve el registro actualizado.
		const {
			rows: [recursoActualizado],
		} = await db.query(recursoQueries.ACTUALIZA_TIPO_RECURSO, valores);
		// Si la query no devuelve ninguna fila, significa que el recurso no se encontró  o no pertenece al edificio del administrador.
		if (!recursoActualizado) {
			throw new AppError(
				`No se encontró un tipo de recurso con ID ${idRecurso} para este edificio.`,
				404
			);
		}

		res.status(200).json({
			success: true,
			message: 'Tipo de recurso actualizado exitosamente.',
			data: {
				recurso: recursoActualizado,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @description Elimina un tipo de recurso existente.
 * @route DELETE /api/admin/recursos/tipos/:id
 * @access Private (administrador)
 */
const eliminarTipoRecurso = async (req, res, next) => {
	try {
		// Obtenemos el ID del recurso a actualizar desde los parámetros de la URL.
		const { id: idRecurso } = req.params;
		// Obtenemos el ID del edificio desde el usuario autenticado para seguridad.
		const idEdificio = req.user.id_edificio_actual;
		// Ejecutamos la query de eliminación.
		const {
			rows: [recursoEliminado],
		} = await db.query(recursoQueries.BORRA_TIPO_RECURSO, [
			idRecurso,
			idEdificio,
		]);
		// Si no se devolvió ninguna fila, el recurso no existía.
		if (!recursoEliminado) {
			throw new AppError(
				`No se encontró un tipo de recurso con ID ${idRecurso} para este edificio.`,
				404
			);
		}
		// El código de estado 204 (No Content) es el estándar para una eliminación
		// exitosa, pero un 200 con mensaje también es común y a veces más claro.
		res.status(200).json({
			success: true,
			message: `El tipo de recurso ${recursoEliminado.nombre} ha sido eliminado exitosamente.`,
		});
	} catch (error) {
		// Manejamos un error de integridad referencial.
		// Si se intenta borrar un tipo de recurso que ya está en uso por 'recursos_asignados',
		// la base de datos lanzará un error 23503.
		if (error.code === '23503') {
			return next(
				new AppError(
					'No se puede eliminar este tipo de recurso porque ya tiene inventario asociado. Primero debe eliminar o reasignar el inventario.',
					409
				)
			); // 409 Conflict
		}
		next(error);
	}
};

/**
 * @description Genera instancias de un recurso de forma masiva siguiendo un patrón secuencial.
 * @route POST /api/admin/recursos/generar-secuencial
 * @access Private (administrador)
 */
const generarRecursosSecuencialmente = async (req, res, next) => {
	try {
		// --- 1. EXTRACCIÓN Y VALIDACIÓN DE DATOS ---
		const { idTipoRecurso, cantidad, patronNombre, numeroInicio } =
			req.body;
		if (!idTipoRecurso || !cantidad || !patronNombre) {
			throw new AppError(
				'El tipo de recurso, la cantidad y el patrón de nombre son obligatorios.',
				400
			);
		}
		const totalAGenerar = parseInt(cantidad, 10);
		const inicio = parseInt(numeroInicio, 10) || 1; // El contador empieza en 1 por defecto

		if (isNaN(totalAGenerar) || totalAGenerar <= 0) {
			throw new AppError(
				'La cantidad debe ser un número mayor que cero.',
				400
			);
		}
		// --- 2. MOTOR DE GENERACIÓN ---
		const recursosParaInsertar = [];
		for (let i = 0; i < totalAGenerar; i++) {
			const contador = inicio + i;

			const identificador = patronNombre
				.replace(/{c}/g, contador)
				.replace(/{c_c}/g, String(contador).padStart(2, '0')) // {C} -> contador con 2 dígitos (01, 02...)
				.replace(/{C}/g, String(contador).padStart(3, '0')); // {C} -> contador con 3 dígitos (001, 002...)

			// Cada recurso es un array: [id_tipo, nombre, id_unidad (null al inicio)]
			recursosParaInsertar.push([
				idTipoRecurso,
				identificador,
				null, // Inicialmente, los recursos no están asignados a ninguna unidad.
			]);
		}
		// --- 3. INSERCIÓN MASIVA ---
		const sql = format(
			recursoQueries.CREA_RECURSOS_MASIVO,
			recursosParaInsertar
		);
		await db.query(sql);
		// --- 4. RESPUESTA EXITOSA ---
		res.status(201).json({
			success: true,
			message: `${totalAGenerar} instancias de recurso han sido creados exitosamente.`,
		});
	} catch (error) {
		// Manejamos el error si se intenta crear recursos para un tipo que no existe.
		if (error.code === '23503') {
			// foreign_key_violation
			return next(
				new AppError(
					`El tipo de recurso con ID '${req.body.idTipoRecurso}' no existe en tu edificio.`,
					404
				)
			);
		}
		next(error);
	}
};

// ExcelJS puede leer un archivo de Excel desde varias fuentes. Como nuestro middleware usará memoryStorage, el archivo subido estará disponible en req.file.buffer. Un "buffer" es simplemente la representación cruda del archivo en la memoria.
// Le pasaremos este buffer a ExcelJS. Él lo abrirá, nos dará acceso a las hojas de cálculo (worksheets), y podremos iterar sobre cada fila (row) para extraer los datos de las celdas.
/**
 * @description Carga un inventario de recursos y opcionalmente los asigna a unidades desde un archivo Excel.
 * @route POST /api/admin/recursos/cargar-inventario
 * @access Private (administrador)
 */
const cargaInventarioArchivo = async (req, res, next) => {
	// Obtenemos un cliente para envolver toda la operación en una transacción.
	const cliente = await db.getClient();
	try {
		// --- 1. VALIDACIÓN PRELIMINAR ---
		if (!req.file) {
			throw new AppError('No se proporcionó ningún archivo Excel.', 400);
		}

		// Iniciamos la transacción para garantizar la integridad de los datos.
		await cliente.query('BEGIN');

		// --- 2. PREPARACIÓN DE DATOS (BÚSQUEDAS PREVIAS) ---
		const idEdificio = req.user.id_edificio_actual;

		// Obtenemos todos los 'Tipos de Recurso' del edificio para validación.
		// Los guardamos en un Map para una búsqueda ultra-rápida (O(1)).
		const { rows: tiposExistentes } = await cliente.query(
			recursoQueries.OBTENER_TIPOS_RECURSO_POR_EDIFICIO,
			[idEdificio]
		);
		const tiposMap = new Map(
			tiposExistentes.map((t) => [t.nombre.toLowerCase(), t.id])
		);

		// Obtenemos todas las 'Unidades' del edificio para la asignación.
		// Las guardamos en un Map usando el nombre de la unidad como clave.
		const { rows: unidadesExistentes } = await cliente.query(
			unidadQueries.OBTENER_UNIDADES_POR_EDIFICIO,
			[idEdificio]
		);
		const unidadesMap = new Map(
			unidadesExistentes.map((u) => [u.numero_unidad.toLowerCase(), u.id])
		);

		// Obtenemos todos los identificadores de recursos que YA existen en el edificio.
		const { rows: recursosExistentes } = await db.query(
			recursoQueries.OBTENER_RECURSOS_ASIGNADOS_POR_EDIFICIO,
			[idEdificio]
		);
		// El objeto Set es para crear un conjunto de identificadores únicos para una búsqueda eficiente.
		const recursosExistentesSet = new Set(
			recursosExistentes.map((r) => r.identificador_unico)
		);

		// --- 3. LECTURA Y PROCESAMIENTO DEL ARCHIVO EXCEL ---
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(req.file.buffer);
		const worksheet = workbook.getWorksheet(1);
		if (!worksheet) {
			throw new AppError(
				'El archivo Excel está vacío o no contiene hojas de cálculo.',
				400
			);
		}

		const recursosParaInsertar = [];
		let errorDeValidacion = null;
		// NO actualizaremos, solo insertaremos los que no existen.
		// La actualización masiva la dejaremos para Misión 6 (Asignación).

		// Iteramos sobre cada fila del Excel, saltando la primera (encabezado).
		worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
			if (rowNumber > 1 && !errorDeValidacion) {
				// Leemos los valores de las 3 columnas, convirtiéndolos a string y quitando espacios.
				const nombreRecurso = (row.getCell(1).value || '')
					.toString()
					.trim()
					.toLowerCase();
				const identificador = (row.getCell(2).value || '')
					.toString()
					.trim();
				const nombrePropietario = (row.getCell(3).value || '')
					.toString()
					.trim()
					.toLowerCase();

				// Si la fila está esencialmente vacía, la saltamos.
				if (!nombreRecurso || !identificador) return;
				// El método .has() verifica la existencia de un elemento. Este es mas rapido que uar includes. Devuelve un booleano que afirma si un elemento está presente con el valor dado en el objeto Set o no.
				// Comparamos el identificador del archivo de excell con respecto a los identificadores que vienen de BD
				if (recursosExistentesSet.has(identificador)) {
					console.log(
						`Recurso '${identificador}' ya existe. Omitiendo.`
					);
					return;
				}

				// VALIDACIÓN 1: ¿Existe el tipo de recurso?
				const idTipoRecurso = tiposMap.get(nombreRecurso);
				if (!idTipoRecurso) {
					errorDeValidacion = `Error en la fila ${rowNumber}: El tipo de recurso "${row.getCell(1).value}" no existe.`;
					return;
				}

				// VALIDACIÓN 2: ¿Existe la unidad propietaria (si se proporcionó)?
				let idUnidad = null;
				if (nombrePropietario) {
					idUnidad = unidadesMap.get(nombrePropietario);
					if (!idUnidad) {
						errorDeValidacion = `Error en la fila ${rowNumber}: La unidad "${row.getCell(3).value}" no existe en este edificio.`;
						return;
					}
				}

				// Si todas las validaciones pasan, añadimos la fila al array de inserción.
				recursosParaInsertar.push([
					idTipoRecurso,
					identificador,
					idUnidad,
				]);
			}
		});

		// Si encontramos un error durante la iteración, detenemos todo.
		if (errorDeValidacion) throw new AppError(errorDeValidacion, 400);
		if (recursosParaInsertar.length === 0)
			throw new AppError(
				'El archivo no contiene datos válidos para importar o ya existen en el sistema.',
				400
			);

		// --- 4. INSERCIÓN MASIVA ---
		const sql = format(
			recursoQueries.CREA_RECURSOS_MASIVO,
			recursosParaInsertar
		);
		await cliente.query(sql);

		// Si todo fue exitoso, confirmamos la transacción.
		await cliente.query('COMMIT');

		res.status(201).json({
			success: true,
			message: `${recursosParaInsertar.length} nuevos recursos han sido creados. Se omitieron ${recursosExistentesSet.size} duplicados.`,
		});
	} catch (error) {
		// Si cualquier error ocurre, la transacción se revierte.
		await cliente.query('ROLLBACK');
		if (error.code === '23505') {
			// unique_violation
			return next(
				new AppError(
					'El archivo contiene identificadores de recurso que ya existen en el sistema.',
					409
				)
			);
		}
		next(error);
	} finally {
		// Siempre liberamos el cliente.
		cliente.release();
	}
};

/**
 * @description Asigna, reasigna o desasigna múltiples recursos a múltiples unidades en una sola operación.
 * @route PATCH /api/admin/recursos/asignaciones
 * @access Private (administrador)
 */
const actualizarAsignaciones = async (req, res, next) => {
	// Obtenemos un cliente para la transacción.
	const cliente = await db.getClient();
	try {
		// --- 1. EXTRACCIÓN Y VALIDACIÓN INICIAL DEL BODY ---
		const { asignaciones } = req.body;
		console.log(asignaciones);

		if (!asignaciones || !Array.isArray(asignaciones)) {
			throw new AppError(
				'El cuerpo de la petición debe contener un array de "asignaciones".',
				400
			);
		}

		// Si el array está vacío, no hay nada que hacer.
		if (asignaciones.length === 0) {
			return res.status(200).json({
				success: true,
				message: 'No se realizaron asignaciones.',
			});
		}

		await cliente.query('BEGIN');
		const idEdificio = req.user.id_edificio_actual;
		// --- 2. BÚSQUEDAS PREVIAS DE SEGURIDAD ---
		// Obtenemos todos los IDs válidos para este edificio en Sets para una búsqueda O(1).
		const { rows: unidadesValidas } = await cliente.query(
			recursoQueries.OBTENER_IDS_UNIDADES_POR_EDIFICIO,
			[idEdificio]
		);
		const unidadesValidasSet = new Set(unidadesValidas.map((u) => u.id));

		const { rows: recursosValidos } = await cliente.query(
			recursoQueries.OBTENER_IDS_RECURSOS_ASIGNADOS_POR_EDIFICIO,
			[idEdificio]
		);
		const recursosValidosSet = new Set(recursosValidos.map((r) => r.id));

		// --- 3. VALIDACIÓN DE CADA ASIGNACIÓN Y PREPARACIÓN DE DATOS ---
		const datosParaActualizar = [];
		for (const asignacion of asignaciones) {
			const { idRecurso, idUnidad } = asignacion;

			// Validamos que el recurso a modificar pertenece al edificio del admin.
			if (!recursosValidosSet.has(idRecurso)) {
				throw new AppError(
					`El recurso con ID ${idRecurso} no existe o no pertenece a tu edificio.`,
					404
				);
			}
			// Validamos que la unidad a la que se asigna (si no es null) pertenece al edificio.
			if (idUnidad !== null && !unidadesValidasSet.has(idUnidad)) {
				throw new AppError(
					`La unidad con ID ${idUnidad} no existe o no pertenece a tu edificio.`,
					404
				);
			}

			// Si todo es válido, añadimos el par [id, nuevo_id_unidad] al lote.
			datosParaActualizar.push([idRecurso, idUnidad]);
			console.log('datos a actualizar', datosParaActualizar);
		}

		// --- 4. EJECUCIÓN DE LA ACTUALIZACIÓN MASIVA ---
		const sql = format(
			recursoQueries.ACTUALIZA_ASIGNACIONES_MASIVO,
			datosParaActualizar
		);
		const { rowCount } = await cliente.query(sql); // rowCount nos dirá cuántas filas fueron afectadas.

		await cliente.query('COMMIT');

		// --- 5. RESPUESTA EXITOSA ---
		res.status(200).json({
			success: true,
			message: `Se han actualizado exitosamente ${rowCount} asignaciones de recursos.`,
		});
	} catch (error) {
		await cliente.query('ROLLBACK');
		next(error);
	} finally {
		cliente.release();
	}
};

/**
 * @description Obtiene todas las instancias de un tipo de recurso específico.
 * @route GET /api/admin/recursos/por-tipo/:idTipo
 * @access Private (administrador)
 */
const obtenerRecursosPorTipo = async (req, res, next) => {
	try {
		const { idTipo } = req.params;
		// No necesitamos validar el idEdificio aquí porque la query ya lo hace implícitamente

		const { rows: recursos } = await db.query(
			recursoQueries.OBTENER_RECURSOS_POR_TIPO,
			[idTipo]
		);

		res.status(200).json({
			success: true,
			count: recursos.length,
			data: {
				recursos,
			},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	crearTipoRecurso,
	obtenerTiposRecurso,
	actualizarTipoRecurso,
	eliminarTipoRecurso,
	generarRecursosSecuencialmente,
	cargaInventarioArchivo,
	actualizarAsignaciones,
	obtenerRecursosPorTipo,
};
