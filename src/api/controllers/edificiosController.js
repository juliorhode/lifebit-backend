/* Importamos objeto de conexion a la base de datos */
const db = require('../../config/db')

/* Controladores CRUD de Edificios */

// Crear un nuevo edificio
const createEdificio = async (req, res) => {
	try {
		// Extraer datos del cuerpo de la petición (req.body)
		const { nombre, direccion } = req.body
		// Validacion de los datos
		if (!nombre) {
			return res.status(400).json({
				error: 'El campo "nombre" es obligatorio',
			})
		}
		if (!direccion) {
			return res.status(400).json({
				error: 'El campo "direccion" es obligatorio',
			})
		}
		// Consulta SQL
		const query =
			'INSERT INTO edificios (nombre, direccion) VALUES ($1,$2) RETURNING *'

		// Preparamos los valores para la consulta
		const values = [nombre, direccion]

		// Ejecutamos la consulta. Usamos await para esperar que la base de datos responda
		const { rows } = await db.query(query, values)

		// Enviamos respuesta exitosa
		res.status(201).json(rows[0])
	} catch (error) {
		console.error('Error al crear el edificio:', error)
		res.status(500).json({
			error: 'Error interno del servidor al crear el edificio',
		})
	}
}

// Obtener todos los edificios
const getAllEdificios = (req, res) => {
	res.send('logica para obtener todos los edificios')
}

// Obtener edificio por su ID
const getEdificioById = (req, res) => {
	const { id } = req.params
	res.send(`logica para obtener el edificio con ID ${id}`)
}

// Actualizar un edificio
const updateEdificio = (req, res) => {
	const { id } = req.params
	res.send(`logica para actualizar el edificio con ID ${id}`)
}

// Eliminar un edificio
const deleteEdificio = (req, res) => {
	const { id } = req.params
	res.send(`logica para eliminar el edificio con ID ${id}`)
}

/* Exportamos los controladores */
module.exports = {
	createEdificio,
	getAllEdificios,
	getEdificioById,
	updateEdificio,
	deleteEdificio,
}
