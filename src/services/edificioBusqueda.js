/**
 * @description Construye una consulta SQL dinámica para buscar edificios basada en filtros.
 * @param {object} filtros - Un objeto que contiene los posibles filtros (ej. { nombre: 'Sol', direccion: 'Avenida' }).
 * @returns {object} Un objeto que contiene la cadena de la consulta SQL (`consulta`) y el arreglo de valores (`valores`) para la consulta parametrizada.
 */

// Esta función recibe los filtros y construye la consulta y los valores.
const busquedaEdificio = (filtros) => {
	const { nombre, direccion, fecha_inicio, fecha_fin } = filtros
	// Empezamos con la base de la consulta. El '1=1' es un truco común que actúa
	// como una condición verdadera que no hace nada. Nos permite añadir
	// condiciones 'AND' después sin preocuparnos si es la primera o no.
	let consulta = 'SELECT * FROM edificios WHERE 1=1'

	// Creamos un arreglo para almacenar los valores de los parámetros de forma segura.
	const valores = []

	// Un contador para los marcadores de posición ($1, $2, etc.)
	let paramIndice = 1

	if (nombre) {
		// Si hay un filtro por 'nombre', añadimos la condición a la consulta.
		// Usamos 'ILIKE' en lugar de 'LIKE' para que la búsqueda no distinga mayúsculas/minúsculas.
		// El '%' es un comodín que significa "cualquier cadena de caracteres".
		// '%Sol%' buscará 'Residencias El Sol', 'Girasol', etc.
		consulta += ` AND nombre ILIKE $${paramIndice}`

		valores.push(`%${nombre}%`)

		paramIndice++
	}
	if (direccion) {
		// Si hay un filtro por 'direccion', hacemos lo mismo.
		consulta += ` AND direccion ILIKE $${paramIndice}`

		valores.push(`%${direccion}%`)

		paramIndice++
	}
	if (fecha_inicio) {
		consulta += ` AND fecha_creacion >= $${paramIndice}`
		valores.push(fecha_inicio) // Formato esperado 'YYYY-MM-DD'
		paramIndice++
	}

	if (fecha_fin) {
		consulta += ` AND fecha_creacion <= $${paramIndice}`
		valores.push(fecha_fin)
		paramIndice++
	}

	// Añadir la ordenación al final
	consulta += ' ORDER BY id ASC'
	return { consulta: consulta, valores: valores }
}

module.exports = {
	busquedaEdificio,
}
