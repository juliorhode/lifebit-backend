const db = require('../../config/db')
const AppError = require('../../utils/appError')
const queries = require('../../queries/licenciaQueries')
const { actualizaQuery } = require('../../utils/queryUtils')

/**
 * @description Crea una nueva licencia (plan de servicio).
 * @route POST /api/owner/licencias
 * @access Private (Rol: dueño_app)
 */
const crearLicencia = async (req, res, next) => {
	try {
		const { nombre_plan, caracteristicas } = req.body
		// Validacion de entrada
		if (!nombre_plan) {
			return next(
				new AppError('El nombre del plan debe ser obligatorio', 400)
			)
		}
		// El campo 'caracteristicas' es opcional, si no viene, lo seteamos a un objeto JSON vacío.
		const caracteristicasJson = caracteristicas
			? JSON.stringify(caracteristicas)
			: '{}'
		const { rows: nuevaLicencia } = await db.query(queries.CREA_LICENCIA, [
			nombre_plan,
			caracteristicasJson,
		])
		res.status(201).json({
			success: true,
			message: 'Licencia creada exitosamente',
			data: {
				licencia: nuevaLicencia,
			},
		})
	} catch (error) {
		// Manejamos el error de violación de unicidad para 'nombre_plan'
		if (error.code === '23505') {
			return next(
				new AppError(
					`Ya existe una licencia con el nombre '${req.body.nombre_plan}'`,
					409
				)
			)
		}
		next(error)
	}
}
/**
 * @description Obtiene una lista de todas las licencias disponibles.
 * @route GET /api/owner/licencias
 * @access Private (Rol: dueño_app)
 */
const obtenerTodasLasLicencias = async (req, res, next) => {
	try {
		const { rows: licencias } = await db.query(queries.TODAS_LICENCIAS)
		if (licencias.length === 0) {
			return next(
				new AppError('No se encontraron licencias para mostrar', 404)
			)
		}
		res.status(200).json({
			success: true,
			count: licencias.length,
			data: {
				licencias,
			},
		})
	} catch (error) {
		next(error)
	}
}
/**
 * @description Obtiene una licencia específica por su ID.
 * @route GET /api/owner/licencias/:id
 * @access Private (Rol: dueño_app)
 */
const obtenerLicenciaPorId = async (req, res, next) => {
	try {
		const { id } = req.params
		const { rows: licencia } = await db.query(queries.LICENCIAS_BY_ID, [id])
		if (licencia.length === 0) {
			return next(
				new AppError(
					`No se encontro ninguna licencia con el ID ${id}`,
					404
				)
			)
		}
		res.status(200).json({
			success: true,
			data: {
				licencia,
			},
		})
	} catch (error) {
		next(error)
	}
}
/**
 * @description Actualiza una licencia existente por su ID.
 * @route PATCH /api/owner/licencias/:id
 * @access Private (Rol: dueño_app)
 */
const actualizarLicencia = async (req, res, next) => {
	try {
		const { id } = req.params
		// Version 1
		// const { nombre_plan, caracteristicas } = req.body
		// Version 2
		const datosActualizar = req.body
		// Primero, verificamos si la licencia que se quiere actualizar realmente existe.
		const { rows: licenciaExistente } = await db.query(
			queries.LICENCIAS_BY_ID,
			[id]
		)
		if (licenciaExistente.length === 0) {
			return next(
				new AppError(
					`No se encontro ninguna licencia con el ID ${id}`,
					404
				)
			)
		}
		// --- CONSTRUCCIÓN DINÁMICA ---
		// Version 1
		// // 1. INICIALIZACIÓN DE AYUDANTES
		// // 'camposActualizar' será un array de strings. Cada string será un trozo de la consulta SQL.
		// // Ejemplo: ['nombre_plan = $1', 'caracteristicas = $2']
		// const camposActualizar = []
		// // 'valores' será un array que contendrá los valores reales que se insertarán en la consulta.
		// // El orden DEBE coincidir con el de 'camposActualizar'.
		// // Ejemplo: ['Básico Plus', '{"max_usuarios": 150}']
		// const valores = []
		// // 'indiceParametro' es un contador para los placeholders ($1, $2, $3...).
		// // Lo necesitamos para que los índices de los placeholders sean correctos sin importar
		// // cuántos campos se actualicen. Siempre empieza en 1.
		// let indiceParametro = 1

		// // 2. PROCESAMIENTO CONDICIONAL DE CADA CAMPO
		// if (nombre_plan) {
		// 	// a) Añadimos el trozo de SQL "nombre_plan = $N" --> "nombre_plan = $1" al array de campos. Usamos el valor actual de 'indiceParametro' y luego lo incrementamos (indiceParametro++).
		// 	camposActualizar.push(`nombre_plan = $${indiceParametro++}`) // Ahora indiceParametro vale 2
		// 	// b) Añadimos el valor real de 'nombre_plan' al array de valores.
		// 	valores.push(nombre_plan)
		// }
		// if (caracteristicas) {
		// 	// a) Añadimos el trozo de SQL "caracteristicas = $N" --> "caracteristicas = $2". Si 'nombre_plan' también vino, indiceParametro ahora es 2.
		// 	camposActualizar.push(`caracteristicas = $${indiceParametro++}`) // Ahora indiceParametro vale 3
		// 	// b) Añadimos el valor real de 'caracteristicas' (convertido a JSON string) al array de valores.
		// 	valores.push(JSON.stringify(caracteristicas))
		// }

		// // 3. VALIDACIÓN Y ENSAMBLAJE FINAL
		// // Si después de revisar todos los campos, el array 'camposActualizar' está vacío, significa que el usuario no envió ningún dato válido para actualizar.
		// if (camposActualizar.length === 0) {
		// 	return next(
		// 		new AppError('No se proporcionaron datos para actualizar', 400)
		// 	)
		// }
		// /// El último valor que necesitamos es el 'id' para la cláusula WHERE. Lo añadimos al final de nuestro array de valores.
		// valores.push(id)
		// // Aquí ocurre la "magia". Ensamblamos la consulta SQL final.
		// // Usamos 'camposActualizar.join(', ')' para unir los trozos de SQL con comas.
		// // Si 'camposActualizar' es ['nombre_plan = $1', 'caracteristicas = $2'], el resultado será
		// // "nombre_plan = $1, caracteristicas = $2".
		// // El placeholder para el 'id' en el WHERE será el valor final de 'indiceParametro'.
		// const LICENCIAS_UPDATE = `update licencias set ${camposActualizar.join(', ')} where id = $${indiceParametro} returning *`

		// Version 2
		const { queryText, valores } = actualizaQuery(
			'licencias',
			id,
			datosActualizar
		)
		const result = await db.query(queryText, valores)
		const licenciaActualizada = result.rows[0]
		res.status(200).json({
			success: true,
			message: 'Licencia actualizada exitosamente',
			data: {
				licenciaActualizada,
			},
		})
    } catch (error) {
		// El error 'No se proporcionaron datos para actualizar.' lanzado por nuestro queryUtils será capturado aquí. Lo convertimos a un AppError para que el errorHandler lo maneje correctamente.
		if (error.message === 'No se proporcionaron datos para actualizar.') {
			return next(new AppError(error.message, 400))
		}
		if (error.code === '23505') {
			return next(
				new AppError(
					`El nombre del plan '${req.body.nombre_plan}' ya esta en uso por otra licencia`,
					409
				)
			)
		}
		next(error)
	}
}
/**
 * @description Elimina una licencia por su ID.
 * @route DELETE /api/owner/licencias/:id
 * @access Private (Rol: dueño_app)
 */
const eliminarLicencia = async (req, res, next) => {
	try {
		const { id } = req.params
		// PRECAUCIÓN: Antes de borrar una licencia, deberíamos verificar si hay algún 'contrato' activo que la esté usando. Si lo hay, deberíamos prohibir el borrado para mantener la integridad de los datos.
		// ADR-002: Implementar chequeo de dependencias antes de borrar licencias en V2.

		// Si eliminaLicencia.length es 0, significa que no se encontró (y por tanto no se borró)
		const { rows: eliminaLicencia } = await db.query(
			queries.LICENCIAS_DELETE,
			[id]
		)
		if (eliminaLicencia.length === 0) {
			return next(
				new AppError(
					`No se encontro ninguna licencia con el ID ${id} para eliminar`,
					404
				)
			)
		}
		// Un código de estado 204 (No Content) es el estándar para una eliminación exitosa,
		// ya que no hay contenido que devolver. Aunque podemos devolver un 200 con un mensaje.
		res.status(200).json({
			success: true,
			message: `Licencia con ID ${id}, eliminada exitosamente`,
		})
	} catch (error) {
		next(error)
	}
}

module.exports = {
	crearLicencia,
	obtenerTodasLasLicencias,
	obtenerLicenciaPorId,
	actualizarLicencia,
	eliminarLicencia,
}
