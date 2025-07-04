const db = require('../../config/db')
const queries = require('../../queries/authQueries')
const bcrypt = require('bcrypt')

/**
 * @description Controlador para registrar un nuevo usuario en el sistema.
 * @param {object} req - El objeto de la petición de Express.
 * @param {object} res - El objeto de la respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware (manejo de errores).
 */
const register = async (req, res, next) => {
	try {
		// Obtenemos los datos del cuerpo de la petición.
		const { nombre, apellido, email, contraseña, telefono, cedula } =
			req.body
		// Verificamos que los campos obligatorios (según la BD) estén presentes.
		if (!nombre || !email || !contraseña || !cedula) {
			return res.status(400).json({
				error: 'Los campos nombre, email, contraseña y cédula son obligatorios.',
			})
		}
		// Hashing de la contraseña.
		// bcrypt.hash es una función asíncrona.
		// El primer argumento es la contraseña en texto plano.
		// El segundo argumento es el 'cost factor' o 'salt rounds'.
		// 10 es un valor por defecto bueno y seguro. Un número más alto es más seguro pero más lento.
		const saltRounds = 10
		const passHash = await bcrypt.hash(contraseña, saltRounds)
		// Guardar el usuario en la base de datos.
		const values = [nombre, apellido, email, passHash, telefono, cedula]
		const { rows } = await db.query(queries.CREA_USUARIO, values)
		// Enviar respuesta exitosa.
		// No devolvemos la contraseña hasheada.
		res.status(201).json({
			message:
				'Usuario registrado exitosamente. Para acceder a un condominio, un administrador debe asignarle un rol.',
			usuario: rows[0],
		})
	} catch (error) {
		// Manejo de errores (ej. email duplicado)
		// 23505 --> unique_violation
		if (error.code === '23505') {
			// Enviamos un error 409 (Conflict) para indicar que el recurso ya existe.
			return res.status(409).json({
				error: 'El correo electrónico o la cédula ya están en uso.',
			})
		}
		// Pasamos el error a nuestro manejador global.
		next(error)
	}
}

module.exports = {
	register,
}
