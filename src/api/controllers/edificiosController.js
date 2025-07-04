/* Importamos objeto de conexion a la base de datos */
const db = require('../../config/db')

/* Importamos las consultas a la base de datos */
const consulta = require('../../queries/edificiosQuerys')

/* Importamos el servicio para consultas a la base de datos */
const edificioService = require('../../services/edificioBusqueda')

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
		// Preparamos los valores para la consulta
		const values = [nombre, direccion]

		// Ejecutamos la consulta. Usamos await para esperar que la base de datos responda
		const { rows } = await db.query(consulta.CREA_EDIFICIO, values)

		// Enviamos respuesta exitosa
		res.status(201).json(rows[0])
	} catch (error) {
		console.error('Error al crear el edificio:', error)
		res.status(500).json({
			error: 'Error interno del servidor al crear el edificio',
		})
	}
	// res.send('logica para crear los edificios')
}

// Obtener todos los edificios
const getAllEdificios = async(req, res) => {
	try {
		// Usamos la desestructuración para obtener 'nombre' y 'direccion'.
		// Si no se proporcionan en la URL, estas variables serán 'undefined'.
		// const { nombre, direccion } = req.query

		// Delegamos la construcción de la consulta al servicio.
		// Le pasamos el objeto req.query completo.
		const { consulta, valores } = edificioService.busquedaEdificio(req.query)
		console.log(consulta)
		console.log(valores)
		

		// Ejecutamos la consulta que el servicio nos preparó.
		const { rows:edificios } = await db.query(consulta, valores)

		// No necesitamos pasar un segundo argumento porque esta consulta no tiene parámetros variables (no hay $1, $2, etc.).
		//const { rows } = await db.query(query.GET_ALL_EDIFICIO)
		// Enviamos un código de estado 200 (OK), que es el estándar para un GET exitoso.
		res.status(200).json(edificios)
	} catch (error) {
		// Si la consulta falla por alguna razón (ej. la base de datos se desconecta), el error será capturado aquí.
		console.error('Erro al obtener los edificios:', error);
		res.status(500).json({
			error: 'Error interno del servidor al obtener los edificios'
		})
		
	}
	// res.send('logica para obtener todos los edificios')
}

// Obtener edificio por su ID
const getEdificioById = async(req, res) => {
	try {
		// 'parseInt' convierte el string del parámetro (que siempre es un string) a un número entero.
		const id = parseInt(req.params.id)
		// Este valor [id] reemplazará de forma segura al marcador de posición $1 en la consulta.
		const { rows } = await db.query(consulta.OBTENER_EDIFICIO_POR_ID, [id])
		// Si el arreglo 'rows' tiene una longitud de 0, significa que no se encontró ningún edificio con ese ID en la base de datos.
		if (rows.length === 0) {
			return res.status(404).json({
				error: `Edificio con ID ${id} no encontrado`,
			})
		}
		// Si se encontró el edificio, estará en la primera (y única) posición del arreglo 'rows'.
		// Lo devolvemos como un objeto JSON con un estado 200 (OK).
		res.status(200).json(rows[0])
	} catch (error) {
		console.error('Error al obtener el edificio por ID:', error);
		res.status(500).json({
			error: 'Error interno del servidor al obtener el edificio'
		})
		
	}

	//res.send(`logica para obtener el edificio con ID ${id}`)
}

// Actualizar un edificio
const updateEdificio = async (req, res) => {
	try {
		// Obtener el ID del edificio de los parámetros de la ruta.
		const idEdificio = parseInt(req.params.id)
		// Obtener los datos a actualizar del cuerpo de la petición.
		const { nombre, direccion } = req.body
		//  Primero, verificar si el edificio existe.
		const edificioExiste = await db.query(consulta.OBTENER_EDIFICIO_POR_ID, [
			idEdificio,
		])
		// Si el arreglo 'rows' está vacío, el edificio no existe.
		if (edificioExiste.rows.length === 0) {
			return res.status(404).json({
				error: `El edificio con ID ${idEdificio} no se ha encontrado`,
			})
		}
		// Si el edificio existe, podemos usar sus datos actuales como valores por defecto si no se proporcionan nuevos valores.
		const edificio = edificioExiste.rows[0]
		const nuevoNombre = nombre || edificio.nombre
		const nuevaDireccion = direccion || edificio.direccion
		// Preparar los valores para la consulta de actualización.
		// El orden debe coincidir con los marcadores de posición en la consulta SQL ($1, $2, $3).
		const valores = [nuevoNombre, nuevaDireccion, idEdificio]
		// Ejecutar la consulta de actualización.
		const { rows } = await db.query(consulta.ACTUALIZA_EDIFICIO, valores)
		// Devolvemos un estado 200 (OK) y el objeto del edificio con sus datos actualizados.
		res.status(200).json(rows[0])
	} catch (error) {
		console.error('Error al actualizar edificio:', error);
		res.status(500).json({
			error: 'Error interno del servidor al actualizar el edificio'
		})
	}

	// res.send(`logica para actualizar el edificio con ID ${id}`)
}

// Eliminar un edificio
const deleteEdificio = async(req, res) => {
	try {
		// Obtener el ID del edificio de los parámetros de la ruta.
		const id = parseInt(req.params.id)

		// Usamos 'rows: [edificioExistente]' para desestructurar y renombrar al mismo tiempo
		const { rows: existe } = await db.query(
			consulta.OBTENER_EDIFICIO_POR_ID,
			[id]
		)
		// Si no se encuentra, devolvemos un 404.
		if (existe.length===0) {
			return res.status(404).json({
				error: `El edificio con ID ${id} no encontrado`,
			})
		}
		// Si existe, ejecutamos la consulta de eliminación.
		await db.query(consulta.BORRA_EDIFICIO, [id])
		// Enviamos la respuesta DELETE exitoso.
		// 204 No Content. No se envía cuerpo en la respuesta.
		res.status(204).send()
	} catch (error) {
		console.error(`Error al eliminiar el edificio`);
		res.status(500).json({
			error: 'Error interno del servidor al eliminar el edificio'
		})
	}
	// res.send(`logica para eliminar el edificio con ID ${id}`)
}

/* Exportamos los controladores */
module.exports = {
	createEdificio,
	getAllEdificios,
	getEdificioById,
	updateEdificio,
	deleteEdificio,
}
