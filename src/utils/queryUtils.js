/**
 * @description Construye dinámicamente una consulta SQL de tipo UPDATE.
 * @param {string} tabla - El nombre de la tabla a actualizar (ej. 'licencias', 'usuarios').
 * @param {number|string} id - El ID del registro a actualizar.
 * @param {object} datos - Un objeto con los campos y valores a actualizar (ej. { nombre_plan: 'Nuevo', ... }).
 * @returns {object} Un objeto con el texto de la consulta ('queryText') y el array de valores ('values').
 * @throws {Error} Si no se proporcionan datos para actualizar.
 *
 * @example
 * const { queryText, values } = buildUpdateQuery('licencias', 1, { nombre_plan: 'Premium' });
 * // queryText -> "UPDATE licencias SET nombre_plan = $1 WHERE id = $2 RETURNING *;"
 * // values    -> ['Premium', 1]
 */
exports.actualizaQuery = (tabla, id, datos) => {
	// 'camposActualizar' será un array de strings. Cada string será un trozo de la consulta SQL.
	// Ejemplo: ['nombre_plan = $1', 'caracteristicas = $2']
	const camposActualizar = []
	// 'valores' será un array que contendrá los valores reales que se insertarán en la consulta.
	// El orden DEBE coincidir con el de 'camposActualizar'.
	// Ejemplo: ['Básico Plus', '{"max_usuarios": 150}']
	const valores = []
	// 'indiceParametro' es un contador para los placeholders ($1, $2, $3...).
	// Lo necesitamos para que los índices de los placeholders sean correctos sin importar
	// cuántos campos se actualicen. Siempre empieza en 1.
	let indiceParametro = 1

	// Iteramos sobre las claves (nombre_plan, caracteristicas) del objeto 'datos'.
	for (const clave in datos) {
		if (datos.hasOwnProperty(clave) && datos[clave] !== undefined) {
			// Usamos la clave como nombre de la columna.
			camposActualizar.push(`${clave} = $${indiceParametro++}`)

			// Si el valor es un objeto, lo convertimos a JSON string (para campos jsonb).
			// Si no, lo usamos tal cual.
			const valor =
				typeof datos[clave] === 'object' && datos[clave] !== null
					? JSON.stringify(datos[clave])
					: datos[clave]

			valores.push(valor)
		}
	}

	if (camposActualizar.length === 0) {
		// Lanzamos un error que será capturado por el bloque catch del controlador.
		throw new Error('No se proporcionaron datos para actualizar.')
	}

	valores.push(id)

	const queryText = `
        UPDATE ${tabla}
        SET ${camposActualizar.join(', ')}
        WHERE id = $${indiceParametro}
        RETURNING *;
    `

	return { queryText, valores }
}
