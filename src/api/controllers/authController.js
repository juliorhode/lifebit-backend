const db = require('../../config/db')
const queries = require('../../queries/authQueries')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const AppError = require('../../utils/appError')
const generaTokens = require('../../utils/jwtUtils')

/**
 * @description Registra un nuevo usuario en el sistema (flujo tradicional).
 * @route POST /api/auth/registro
 * @description Ejem. { "nombre": "Pepe","apellido": "Pepito","email": "pepe@email.com","telefono": "0123234","contraseña": "123456789","cedula": "V242342"
}
 * @access Public
 */

const register = async (req, res, next) => {
	try {
		// Extraemos los datos del cuerpo de la petición
		const { nombre, apellido, email, contraseña, telefono, cedula } =
			req.body
		// Verificamos que los campos obligatorios (según la BD) estén presentes.
		if (!nombre || !apellido || !email || !contraseña || !cedula) {
			// Si faltan datos, pasamos un error al manejador de errores global.
			// 'next' es la forma de invocar el siguiente middleware, que en este caso
			// será nuestro 'errorHandler'.
			return next(
				new AppError(
					'Por favor, proporcione nombre, apellido, email, cedula y contraseña',
					400
				)
			)
			// return res.status(400).json({
			// 	error: 'Los campos nombre, apellido, email, contraseña, cédula son obligatorios.',
			// })
		}

		// Me gusta mas en el cath, ya que no consulto a la base de datos para eso sino que aprovecho el error
		// const usuarioExists = await db.query(queries.USUARIO_EXISTE, [email])
		// if (usuarioExists.rows.length > 0) {
		// 	return next(
		// 		new AppError('El correo electronico ya esta registrado', 409)
		// 	) // codigo Conflict
		// }

		// Hashing de la contraseña.
		// bcrypt.hash es una función asíncrona.
		// El primer argumento es la contraseña en texto plano.
		// El segundo argumento es el 'cost factor' o 'salt rounds'.
		// 'genSalt' genera una "sal" aleatoria para añadir a la contraseña antes de hashearla.
		// El número (ej. 10) es el "costo" o "rondas" del hasheo. Más alto = más seguro pero más lento. 10 es un buen balance.
		const salt = await bcrypt.genSalt(10)
		const passHash = await bcrypt.hash(contraseña, salt)

		// Guardar el usuario en la base de datos.
		const values = [nombre, apellido, email, passHash, telefono, cedula]
		// desestructuro rows y lo renombro al mismo tiempo
		const { rows: newUser } = await db.query(queries.CREA_USUARIO, values)
		// Enviar respuesta exitosa.
		// No devolvemos la contraseña hasheada.
		res.status(201).json({
			// 201 Created
			message: 'Usuario registrado exitosamente.',
			data: newUser,
		})
	} catch (error) {
		// Manejo de errores (ej. email duplicado)
		// 23505 --> unique_violation
		if (error.code === '23505') {
			// Enviamos un error 409 (Conflict) para indicar que el recurso ya existe.
			// return res.status(409).json({
			// 	error: 'El correo electrónico o la cédula ya están en uso.',
			// })
			return next(
				new AppError('El correo electronico ya esta registrado', 409)
			)
		}
		// Pasamos el error a nuestro manejador global.
		next(error)
	}
}

/**
 * @description Autentica a un usuario y devuelve tokens de acceso.
 * @route POST /api/auth/login
 * @description Ejem. {"email": "juliorhode@gmail.com","contraseña" :"123456789"}
 * @access Public
 */

const login = async (req, res, next) => {
	try {
		// 1. Extraer email y contraseña del cuerpo de la petición.
		const { email, contraseña } = req.body
		// 2. Validar que los datos de entrada existen.
		if (!email || !contraseña) {
			return next(
				new AppError(
					'Por favor, proporciones un email y una contraseña',
					400
				)
			)
		}
		// 3. Verificamos si existe el usuario
		const result = await db.query(queries.USUARIO_EXISTE, [email])
		const usuario = result.rows[0]
		// console.log(usuario.email);
		// console.log(usuario.contraseña)

		// 4. Usamos bcrypt.compare para comparar de forma segura la contraseña enviada con el hash almacenado en la base de datos.
		if (
			!usuario ||
			!(await bcrypt.compare(contraseña, usuario.contraseña))
		) {
			// El mensaje de error es genérico. Esto previene "ataques de enumeración de usuarios"
			return next(new AppError('Email o contraseña invalida', 401))
		}
		// 5. Si el usuario y la contraseña son correctos, generamos los tokens.
		// Creamos el payload para los tokens.
		const payload = {
			id: usuario.id,
			// aqui deberiamos obtener el rol de la tabla afiliaciones (por ahora asumiremos el rol generico)
		}
		const tokens = generaTokens(payload)
		// 6. Enviar los tokens y la información del usuario en la respuesta.
		// Eliminamos la contraseña del objeto de usuario antes de enviarlo.
		usuario.contraseña = undefined

		res.status(200).json({
			success: true,
			message: 'Login exitoso',
			tokens,
			data: {
				usuario,
			},
		})
	} catch (error) {
		next(error)
	}
}

/**
 * @description Obtiene el perfil del usuario actualmente autenticado.
 * @route GET /api/auth/perfil
 * @access Private (requiere token)
 */
const obtenerPerfil = (req, res, next) => {
    // Gracias a nuestro middleware 'protegerRuta', el objeto 'req'
    // ahora contiene la información del usuario en 'req.user'.
    // No necesitamos buscarlo en la base de datos de nuevo aquí.
    
    res.status(200).json({
        success: true,
        data: {
            user: req.user
        }
    });
};

/**
 * @description Genera un nuevo accessToken a partir de un refreshToken válido.
 * @route POST /api/auth/refresh-token
 * @access Public (pero requiere un refreshToken válido)
 */
const refreshToken = async (req, res, next) => {
	try {
		// 1. Obtener el refreshToken del cuerpo de la petición.
		// El frontend lo enviará en el cuerpo del JSON.
		const { refreshToken } = req.body
		if (!refreshToken) {
			return next(
				new AppError('No se proporcionó un token de refresco', 400)
			)
		}
		// 2. Verificar el refreshToken usando el SECRETO DE REFRESCO.
		// Usamos un bloque try...catch aquí dentro específicamente para la verificación,
		// porque el error que lanza 'verify' es el que nos interesa atrapar.
		let decoded
		try {
			decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
		} catch (error) {
			return next(
				new AppError(
					'Token de refresco invalido o expirado. Por favor, inicie sesion de nuevo',
					403
				)
			) // 403 forbidden
		}
		// 3. (Opcional pero recomendado) Verificar que el usuario del token aún existe y está activo.
		// Esto previene que un refreshToken siga siendo válido para un usuario que ha sido eliminado o suspendido.
		const result = await db.query(queries.USUARIO_TOKEN, [decoded.id])
		const usuario = result.rows[0]
		if (!usuario || usuario.estado !== 'activo') {
			return next(
				new AppError(
					'No se puede refrescar el token para este usuario',
					403
				)
			)
		}
		// 4. Si todo es correcto, generamos un NUEVO accessToken.
		// Creamos el payload con la información fresca del usuario.
		const payload = {
			id: usuario.id,
			//rol: usuario.rol para el futuro
		}
		// ¡Ojo! Solo generamos un nuevo accessToken. El refreshToken original sigue siendo válido
		// hasta que expire. No necesitamos emitir uno nuevo en cada refresco.
		const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN
		})
		// 5. Enviamos el nuevo accessToken.
		res.status(200).json({
			success: true,
			message: 'Token de acceso renovado exitosamente',
			accessToken
		})
	} catch (error) {
		next(error)
	}
}


module.exports = {
	register,
	login,
	obtenerPerfil,
	refreshToken
}
