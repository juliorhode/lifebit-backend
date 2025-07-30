const db = require('../../config/db');
const AppError = require('../../utils/appError');
const recursoQueries = require('../../queries/recursoQueries');
const format = require('pg-format');


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
		const {rows: [recursoEliminado]} = await db.query(recursoQueries.BORRA_TIPO_RECURSO, [idRecurso,idEdificio]);
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
        const sql = format(recursoQueries.CREA_RECURSOS_MASIVO, recursosParaInsertar);
        await db.query(sql);
        // --- 4. RESPUESTA EXITOSA ---
        res.status(201).json({
            success: true,
            message: `${totalAGenerar} instancias de recurso han sido creados exitosamente.`,
        })

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
}

module.exports = {
	crearTipoRecurso,
	obtenerTiposRecurso,
    actualizarTipoRecurso,
    eliminarTipoRecurso,
    generarRecursosSecuencialmente
};

