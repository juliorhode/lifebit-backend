/**
 * @file licenciaController.js
 * @description Controlador para la gestión de licencias del Dueño del sistema (SaaS LifeBit).
 * Implementa un CRUD completo y seguro: crear, listar, ver, actualizar y eliminar licencias.
 */

const db = require('../../config/db'); // fachada para interacción con PostgreSQL
const AppError = require('../../utils/appError'); // manejador de errores consistente del proyecto
const licenciasQueries = require('../../queries/licenciasQueries'); // queries SQL centralizadas

/**
 * @route POST /api/owner/licencias
 * @desc Crea una nueva licencia (plan de servicio)
 * @access Private (dueño_app)
 */
const crearLicencia = async (req, res, next) => {
	try {
		// Desestructuramos los datos esperados del cuerpo.
		const { nombre_plan, precio_base, caracteristicas } = req.body;

		// Validaciones mínimas en backend (KISS).
		if (!nombre_plan || precio_base === undefined || precio_base === null) {
			return next(new AppError('El nombre del plan y el precio base son obligatorios.', 400));
		}

		// OPTIMIZACIÓN: Validar que precio_base sea un número finito y no negativo.
		// Esto previene errores en cálculos posteriores y asegura integridad de datos.
		// Anteriormente solo se verificaba que no fuera null/undefined, permitiendo valores inválidos.
		if (typeof precio_base !== 'number' || !isFinite(precio_base) || precio_base < 0) {
			return next(new AppError('El precio base debe ser un número válido y no negativo.', 400));
		}

		// Intentamos insertar la licencia.
		const { rows } = await db.query(licenciasQueries.INSERT_LICENCIA, [
			nombre_plan,
			precio_base,
			caracteristicas || null,
		]);

		// Respondemos con el recurso creado.
		return res.status(201).json({
			success: true,
			message: 'Licencia creada exitosamente',
			data: rows[0],
		});
	} catch (error) {
		// Capturamos unique_violation para dar un mensaje útil al cliente.
		if (error.code === '23505') {
			return next(new AppError('Ya existe una licencia con ese nombre.', 409));
		}
		// Pasamos cualquier otro error al manejador global.
		return next(error);
	}
};

/**
 * @route GET /api/owner/licencias
 * @desc Obtiene todas las licencias con paginación opcional
 * @access Private (dueño_app)
 * @query {number} page - Página a obtener (1-based, default: 1)
 * @query {number} limit - Número de elementos por página (default: 10, max: 100)
 */
const obtenerLicencias = async (req, res, next) => {
	try {
		// OPTIMIZACIÓN: Implementar paginación para manejar listas grandes eficientemente.
		// Previene sobrecarga de memoria y mejora tiempos de respuesta.
		// Valores por defecto seguros para compatibilidad backward.
		const page = parseInt(req.query.page) || 1;
		const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Máximo 100 para seguridad
		const offset = (page - 1) * limit;

		// Validar parámetros de paginación
		if (page < 1 || limit < 1) {
			return next(new AppError('Los parámetros de paginación deben ser números positivos.', 400));
		}

		// Ejecutar queries en paralelo para mejor rendimiento
		const [licenciasResult, countResult] = await Promise.all([
			db.query(licenciasQueries.OBTENER_LICENCIAS_PAGINADAS, [limit, offset]),
			db.query(licenciasQueries.CONTAR_LICENCIAS)
		]);

		const total = parseInt(countResult.rows[0].total);
		const totalPages = Math.ceil(total / limit);

		return res.status(200).json({
			success: true,
			data: licenciasResult.rows,
			pagination: {
				current_page: page,
				per_page: limit,
				total_pages: totalPages,
				total_items: total,
				has_next: page < totalPages,
				has_prev: page > 1
			}
		});
	} catch (error) {
		return next(error);
	}
};

/**
 * @route GET /api/owner/licencias/:id
 * @desc Obtiene una licencia por su ID
 * @access Private (dueño_app)
 */
const obtenerLicenciaPorId = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { rows } = await db.query(licenciasQueries.OBTENER_LICENCIA_BY_ID, [id]);

		if (!rows || rows.length === 0) {
			return next(new AppError(`No se encontró ninguna licencia con ID ${id}.`, 404));
		}

		return res.status(200).json({
			success: true,
			data: rows[0],
		});
	} catch (error) {
		return next(error);
	}
};

/**
 * @route PATCH /api/owner/licencias/:id
 * @desc Actualiza una licencia existente
 * @access Private (dueño_app)
 */
const actualizarLicencia = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { nombre_plan, precio_base, caracteristicas } = req.body;

		// Ejecutamos la query de actualización (usa COALESCE internamente).
		const { rows } = await db.query(licenciasQueries.UPDATE_LICENCIA, [
			nombre_plan ?? null,
			precio_base ?? null,
			caracteristicas ?? null,
			id,
		]);

		if (!rows || rows.length === 0) {
			return next(new AppError(`No se encontró la licencia con ID ${id}.`, 404));
		}

		return res.status(200).json({
			success: true,
			message: 'Licencia actualizada exitosamente',
			data: rows[0],
		});
	} catch (error) {
		// Manejo de conflicto por nombre duplicado.
		if (error.code === '23505') {
			return next(
				new AppError('No se pudo actualizar: ya existe una licencia con ese nombre.', 409)
			);
		}
		return next(error);
	}
};

/**
 * Nota: Antes de habilitar borrados en producción, considerar:
 * - Validar que no existan contratos que referencien la licencia.
 * - Implementar "soft delete" (is_archived) si queremos conservar historial.
 */

/**
 * @route DELETE /api/owner/licencias/:id
 * @desc Elimina una licencia existente
 * @access Private (dueño_app)
 */
const eliminarLicencia = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { rows } = await db.query(licenciasQueries.DELETE_LICENCIA, [id]);

		if (!rows || rows.length === 0) {
			return next(new AppError(`No se encontró la licencia con ID ${id}.`, 404));
		}

		return res.status(200).json({
			success: true,
			message: `Licencia con ID ${id} eliminada correctamente`,
		});
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	crearLicencia,
	obtenerLicencias,
	obtenerLicenciaPorId,
	actualizarLicencia,
	eliminarLicencia,
};

