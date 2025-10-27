const crypto = require('crypto');
const db = require('../../config/db');
const queries = require('../../queries/authQueries');
const usuarioQueries = require('../../queries/usuarioQueries');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenUtils = require('../../utils/tokenUtils');
const trabajoQueries = require('../../queries/trabajoQueries');
const format = require('pg-format');
const AppError = require('../../utils/appError');
const generaTokens = require('../../utils/jwtUtils');


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
		const { nombre, apellido, email, contraseña, telefono, cedula } = req.body;
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
			);
			// return res.status(400).json({
			// 	error: 'Los campos nombre, apellido, email, contraseña, cédula son obligatorios.',
			// })
		}

		// Me gusta mas en el catch, ya que no consulto a la base de datos para eso sino que aprovecho el error
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
		const salt = await bcrypt.genSalt(10);
		const passHash = await bcrypt.hash(contraseña, salt);

		// Guardar el usuario en la base de datos.
		const values = [nombre, apellido, email, passHash, telefono, cedula];
		// desestructuro rows y lo renombro al mismo tiempo
		const { rows: nuevoUsuario } = await db.query(queries.CREA_USUARIO, values);
		// Enviar respuesta exitosa.
		// No devolvemos la contraseña hasheada.
		res.status(201).json({
			// 201 Created
			message: 'Usuario registrado exitosamente.',
			data: nuevoUsuario,
		});
	} catch (error) {
		// Manejo de errores (ej. email duplicado)
		// 23505 --> unique_violation
		if (error.code === '23505') {
			// Enviamos un error 409 (Conflict) para indicar que el recurso ya existe.
			// return res.status(409).json({
			// 	error: 'El correo electrónico o la cédula ya están en uso.',
			// })
			return next(new AppError('El correo electronico ya esta registrado', 409));
		}
		// Pasamos el error a nuestro manejador global.
		next(error);
	}
};

/**
 * @description Autentica a un usuario y devuelve tokens de acceso.
 * @route POST /api/auth/login
 * @description Ejem. {"email": "juliorhode@gmail.com","contraseña" :"123456789"}
 * @access Public
 */
const login = async (req, res, next) => {
	try {
		// 1. Extraer email y contraseña del cuerpo de la petición.
		const { email, contraseña } = req.body;
		// 2. Validar que los datos de entrada existen.
		if (!email || !contraseña) {
			throw new AppError('Por favor, proporciones un email y una contraseña', 400);
		}
		// 3. Verificamos si existe el usuario
		const result = await db.query(queries.USUARIO_EXISTE, [email]);
		const usuario = result.rows[0];
		// console.log(usuario.email);
		// console.log(usuario.contraseña)

		// 4. Usamos bcrypt.compare para comparar de forma segura la contraseña enviada con el hash almacenado en la base de datos.
		if (!usuario || !(await bcrypt.compare(contraseña, usuario.contraseña))) {
			// El mensaje de error es genérico. Esto previene "ataques de enumeración de usuarios"
			throw new AppError('Email o contraseña invalida', 401);
		}

		// 5. Si el usuario y la contraseña son correctos, generamos los tokens.
		// Creamos el payload para los tokens.
		// ADR-001: Usamos el rol directamente de la tabla usuarios para el MVP.
		const payload = {
			id: usuario.id,
			rol: usuario.rol,
			id_edificio: usuario.id_edificio_actual, // Incluimos el ID del edificio en el token
		};
		const { accessToken, refreshToken } = generaTokens(payload);
		// Enviamos el refreshToken como una HttpOnly cookie.
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
		});
		// 6. Enviar los tokens y la información del usuario en la respuesta.
		// Eliminamos la contraseña del objeto de usuario antes de enviarlo.
		usuario.contraseña = undefined;

		res.status(200).json({
			success: true,
			message: 'Login exitoso',
			accessToken,
			data: {
				usuario,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @description Cierra la sesión del usuario invalidando la refreshToken cookie.
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = (req, res, next) => {
	// Le decimos al navegador que borre la cookie 'refreshToken'.
	// Lo hacemos enviando una cookie con el mismo nombre, un valor vacío
	// y una fecha de expiración inmediata (maxAge: 0).
	res.cookie('refreshToken', '', {
		httpOnly: true,
		expires: new Date(0), // Expira inmediatamente.
	});
	res.status(200).json({
		success: true,
		message: 'Cierre de sesión exitoso',
	});
}

/**
 * @description Genera un nuevo accessToken a partir de un refreshToken válido.
 * @route POST /api/auth/refresh-token
 * @access Public (pero requiere un refreshToken válido)
 */
const refreshToken = async (req, res, next) => {
	try {
		// 1. Obtenemos el refreshToken DESDE LAS COOKIES, no desde el body.
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			return next(
				new AppError('No se proporcionó un token de refresco o la sesión ha expirado.', 400)
			);
		}
		// 2. Verificar el refreshToken usando el SECRETO DE REFRESCO.
		// Usamos un bloque try...catch aquí dentro específicamente para la verificación,
		// porque el error que lanza 'verify' es el que nos interesa atrapar.
		let decoded;
		try {
			decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
		} catch (error) {
			return next(
				new AppError(
					'Token de refresco invalido o expirado. Por favor, inicie sesion de nuevo',
					403
				)
			); // 403 forbidden
		}
		// 3. (Opcional pero recomendado) Verificar que el usuario del token aún existe y está activo.
		// Esto previene que un refreshToken siga siendo válido para un usuario que ha sido eliminado o suspendido.
		const result = await db.query(queries.USUARIO_TOKEN, [decoded.id]);
		const usuario = result.rows[0];
		if (!usuario || usuario.estado !== 'activo') {
			return next(new AppError('No se puede refrescar el token para este usuario', 403));
		}
		// 4. Si todo es correcto, generamos un NUEVO accessToken.
		// Creamos el payload con la información fresca del usuario.
		const payload = {
			id: usuario.id,
			// rol: usuario.rol,
			// id_edificio: user.id_edificio_actual, // Incluimos el ID del edificio en el token
		};
		// ¡Ojo! Solo generamos un nuevo accessToken. El refreshToken original sigue siendo válido
		// hasta que expire. No necesitamos emitir uno nuevo en cada refresco.
		const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});
		// 5. Enviamos el nuevo accessToken.
		res.status(200).json({
			success: true,
			message: 'Token de acceso renovado exitosamente',
			accessToken,
			data: {
				usuario
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @description Finaliza el registro de un usuario invitado usando un token.
 * @route POST /api/auth/finalizar-registro
 */
const finalizarRegistro = async (req, res, next) => {
	try {
		const { token, contraseña } = req.body;

		if (!token || !contraseña) {
			throw new AppError('Por favor, proporcione el token y su nueva contraseña.', 400);
		}

		// Hasheamos el token recibido del cliente para buscarlo en la BD.
		const tokenHasheado = crypto.createHash('sha256').update(token).digest('hex');

		// --- BLOQUE DE DEPURACIÓN ---
		console.log('--- Depurando finalizarRegistro ---');
		console.log('Token recibido (plano):', token);
		console.log('Token hasheado (para la búsqueda):', tokenHasheado);
		console.log('Query a ejecutar:', usuarioQueries.OBTENER_INVITADO_POR_TOKEN);
		console.log('---------------------------------');

		// Buscamos al usuario invitado.
		const result = await db.query(usuarioQueries.OBTENER_INVITADO_POR_TOKEN, [tokenHasheado]);
		const usuario = result.rows[0];
		if (!usuario) {
			throw new AppError('El token es invalido, ha espirado o ya fue utilizado', 400);
		}

		// Hasheamos la nueva contraseña.
		const salt = await bcrypt.genSalt(10);
		const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

		// Activamos al usuario en la BD.
		await db.query(usuarioQueries.ACTIVAR_USUARIO, [contraseñaHasheada, usuario.id]);

		res.status(200).json({
			success: true,
			message: 'Tu cuenta ha sido activada. Ahora puedes iniciar sesion.',
		});
	} catch (error) {
		next(error);
	}
};
/**
 * @description Inicia el flujo de reseteo de contraseña para un usuario.
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		if (!email) {
			throw new AppError('Por favor, proporcione un email', 400);
		}

		// 1. Buscar al usuario activo por su email.
		const {
			rows: [usuario],
		} = await db.query(usuarioQueries.OBTENER_USUARIO_ACTIVO_POR_EMAIL, [email]);
		// Si no se encuentra el usuario, NO devolvemos un error 404.
		// Enviamos una respuesta de éxito genérica para no revelar si un email
		// está registrado en nuestro sistema (previene la enumeración de usuarios).
		if (!usuario) {
			return res.status(200).json({
				success: true,
				message:
					'Si existe una cuenta con este email, recibirás un correo con instrucciones para restablecer tu contraseña.',
			});
		}
		// 2. Generar el token de reseteo.
		// Reutilizaremos nuestra utilidad de tokens de registro, ya que el principio es el mismo.
		const { tokenPlano, tokenHasheado } = tokenUtils.generaTokenRegistro();
		const tokenExpira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos de expiración
		// 3. Guardar el token hasheado y la expiración en la base de datos.
		await db.query(usuarioQueries.GUARDAR_TOKEN_RESETEO, [
			tokenHasheado,
			tokenExpira,
			usuario.id,
		]);
		// 4. Encolar el trabajo de envío de email.
		// Para ser consistentes, también lo encolamos, aunque sea un solo email.
		const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
		const payloadEmail = {
			destinatarioEmail: usuario.email,
			destinatarioNombre: nombreCompleto,
			token: tokenPlano,
		};
		// mandamos [[...]] porque pg-format siempre espera un array de filas. Incluso si solo hay una fila, debemos dársela dentro de un array contenedor, ya que la query tiene el placeholder %L que espera una lista de valores
		const datosTrabajo = [['enviar_email_reseteo_pass', JSON.stringify(payloadEmail)]];
		// %L no es parte del lenguaje SQL. Es un placeholder específico de la librería pg-format, por lo tanto debemos pre-procesarla con la funcion format antes de pasarla a db.query()... db.query() solo entiende los placeholders $1, $2, etc.
		const sql = format(trabajoQueries.CREA_TRABAJOS_MASIVO, datosTrabajo);
		await db.query(sql);
		// 5. Enviar la misma respuesta de éxito genérica.
		res.status(200).json({
			success: true,
			message:
				'Si existe una cuenta con este email, recibirás un correo con instrucciones para restablecer tu contraseña.',
		});
	} catch (error) {
		next(error);
	}
};
/**
 * @description Restablece la contraseña de un usuario usando un token válido.
 * @route PATCH /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res, next) => {
	try {
		// 1. OBTENER TOKEN Y NUEVA CONTRASEÑA
		const { token, contraseña } = req.body;
		if (!token || !contraseña) {
			throw new AppError('El token y la nueva contraseña son obligatorios.', 400);
		}
		// 2. VALIDAR EL TOKEN
		// Hasheamos el token en texto plano que nos llega del cliente.
		const tokenHasheado = crypto.createHash('sha256').update(token).digest('hex');
		// Buscamos un usuario con ese token que no haya expirado.
		const {
			rows: [usuario],
		} = await db.query(usuarioQueries.OBTENER_USUARIO_POR_TOKEN_RESETEO, [tokenHasheado]);
		if (!usuario) {
			// Mensaje genérico para atacantes.
			throw new AppError('El token es invalido, ha espirado o ya fue utilizado', 400);
		}
		// 3. ACTUALIZAR LA CONTRASEÑA
		// Hasheamos la nueva contraseña antes de guardarla.
		const salt = await bcrypt.genSalt(10);
		const contraseñaHasheada = await bcrypt.hash(contraseña, salt);
		// Ejecutamos la query que actualiza la contraseña y limpia los tokens de reseteo.
		await db.query(usuarioQueries.RESETEAR_CONTRASENA, [contraseñaHasheada, usuario.id]);
		// 4. RESPUESTA EXITOSA
		res.status(200).json({
			success: true,
			message:
				'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @description Permite a un usuario autenticado cambiar su propia contraseña.
 * Si todo sale bien, se genera nuevos tokens para invalidar sesiones anteriores.
 * @route PATCH /api/auth/update-password
 * @access Private (cualquier rol autenticado)
 */
const updatePassword = async (req, res, next) => {
	try {
		// --- 1. OBTENER DATOS Y VALIDAR ---
		// Obtenemos el ID del usuario directamente del token que viene de 'protegeRuta'
		const idUsuario = req.user.id;
		const { contraseñaActual, nuevaContraseña } = req.body;

		if (!contraseñaActual || !nuevaContraseña) {
			throw new AppError(
				'Por favor, proporcione la contraseña actual y la nueva contraseña',
				400
			);
		}

		// --- 2. VERIFICAR LA CONTRASEÑA ACTUAL ---
		// Obtenemos solo el hash de la contraseña de la BD.
		const {
			rows: [usuario],
		} = await db.query(usuarioQueries.OBTENER_CONTRASENA_POR_ID, [idUsuario]);

		// Comparamos de forma segura el hash de la BD con la contraseña que nos envió el usuario.
		const contraseñaCorrecta = await bcrypt.compare(contraseñaActual, usuario.contraseña);
		if (!contraseñaCorrecta) {
			throw new AppError('La contraseña actual es incorrecta', 401); // 401 Unauthorized
		}

		// --- 3. HASHEAR Y GUARDAR LA NUEVA CONTRASEÑA ---
		const salt = await bcrypt.genSalt(10);
		const contraseñaHasheada = await bcrypt.hash(nuevaContraseña, salt);
		await db.query(usuarioQueries.ACTUALIZAR_CONTRASENA, [contraseñaHasheada, idUsuario]);

		// --- 4. GENERAR NUEVOS TOKENS (SEGURIDAD) ---
		// Al generar un nuevo set de tokens, cualquier 'refreshToken' que pudiera
		// estar activo en otros dispositivos (ej. un portátil robado) quedará invalidado,
		// ya que el frontend deberá usar el nuevo refreshToken.
		const payload = {
			id: req.user.id,
			rol: req.user.rol,
			id_edificio: req.user.id_edificio_actual,
		};
		const { accessToken, refreshToken } = generaTokens(payload);
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
		});

		res.status(200).json({
			success: true,
			message:
				'Tu contraseña ha sido actualizada exitosamente. Por seguridad, por favor vuelve a iniciar sesión.',
			accessToken, // Enviamos los nuevos tokens al frontend.
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @description Maneja el callback de Google OAuth. Este es el "cerebro" central que
 * determina qué acción realizar (Login, Vinculación o Activación) basándose en el
 * estado del usuario en la base de datos.
 * @route GET /api/auth/google/callback
 */
const googleCallback = async (req, res, next) => {
	try {
		// 1. OBTENER PERFIL DE GOOGLE
		// Passport.js, tras una autenticación exitosa con Google, adjunta el perfil
		// del usuario al objeto `req.user`.
		const perfilGoogle = req.user;

		// Guarda de seguridad: si por alguna razón no hay perfil, redirigimos con error.
		if (!perfilGoogle) {
			return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth-failed`);
		}

		// Extraemos los datos clave que usaremos para la lógica de negocio.
		const email = perfilGoogle.emails[0].value;
		const googleId = perfilGoogle.id;
		// Extraemos la URL de la foto. 
		// Algunas cuentas de Google pueden no tener foto.
		// El perfilGoogle.photos es un array, tomamos el primer elemento si existe.
		// Si no existe, asignamos null.
		// Ejemplo de perfilGoogle.photos: [ { value: 'https://lh3.googleusercontent.com/a-/AOh14Gg...' } ]
		// Usamos un operador ternario para manejar ambos casos.
		// Si photos existe y tiene al menos un elemento, usamos su valor. Si no, null.
		// Esto previene errores si el usuario no tiene foto en su cuenta de Google.
		const avatarUrl = perfilGoogle.photos && perfilGoogle.photos[0] ? perfilGoogle.photos[0].value : null;
		
		console.log('Avatar URL del usuario:', avatarUrl);

		let usuario; // Declaramos una variable 'usuario' que llenaremos en uno de los flujos.

		// --- INICIO DE LA LÓGICA DE DECISIÓN DE 3 VÍAS ---

		// 2. ESCENARIO 1: LOGIN DE UN USUARIO YA VINCULADO
		// Es la primera y más común verificación. Buscamos si ya conocemos a este usuario
		// por su identificador único de Google.
		const {
			rows: [usuarioPorGoogleId],
		} = await db.query(usuarioQueries.OBTENER_USUARIO_POR_GOOGLE_ID, [googleId]);

		if (usuarioPorGoogleId) {
			// Si lo encontramos, es un simple login.
			console.log(`Flujo de LOGIN con Google para: ${email}`);
			usuario = usuarioPorGoogleId;
		} else {
			// Si no lo encontramos por su Google ID, podría ser un usuario tradicional o un invitado.

			// 3. ESCENARIO 2: VINCULACIÓN DE UNA CUENTA TRADICIONAL EXISTENTE
			// Buscamos si existe un usuario ACTIVO con este email que aún no tenga un google_id.
			const {
				rows: [usuarioTradicional],
			} = await db.query(usuarioQueries.OBTENER_USUARIO_ACTIVO_POR_EMAIL_SIN_GOOGLE, [email]);

			if (usuarioTradicional) {
				// Si lo encontramos, significa que un usuario con contraseña quiere vincular su cuenta.
				console.log(`Flujo de VINCULACIÓN para cuenta tradicional: ${email}`);
				// Actualizamos su registro para añadirle el google_id.
				const {
					rows: [usuarioActualizado],
				} = await db.query(usuarioQueries.VINCULAR_GOOGLE_ID, [
					googleId,
					avatarUrl,
					usuarioTradicional.id,
				]);
				usuario = usuarioActualizado;
			} else {
				// Si tampoco es un usuario tradicional, solo queda una opción...

				// 4. ESCENARIO 3: ACTIVACIÓN DE UNA CUENTA INVITADA
				// Buscamos si existe un usuario INVITADO con este email.
				const {
					rows: [usuarioInvitado],
				} = await db.query(usuarioQueries.OBTENER_INVITADO_POR_EMAIL, [email]);

				if (!usuarioInvitado) {
					// Si llegamos aquí, el usuario es un completo desconocido. No tiene cuenta,
					// ni tradicional ni invitada. No puede acceder.
					return res.redirect(
						`${process.env.FRONTEND_URL}/login?error=account-not-found`
					);
				}

				// Si lo encontramos, es una activación.
				console.log(`Flujo de ACTIVACIÓN con Google para: ${email}`);
				// Actualizamos su registro para activarlo Y vincular su google_id.
				const {
					rows: [usuarioActualizado],
				} = await db.query(usuarioQueries.ACTIVAR_Y_VINCULAR_GOOGLE, [
					googleId,
					avatarUrl,
					usuarioInvitado.id,
				]);
				usuario = usuarioActualizado;
			}
		}

		// --- PUNTO DE CONTROL FINAL ---
		// Después de cualquiera de los 3 flujos exitosos, debemos tener un objeto 'usuario' válido.
		// Verificamos que no esté suspendido.
		if (!usuario || usuario.estado !== 'activo') {
			return res.redirect(
				`${process.env.FRONTEND_URL}/login?error=account-inactive-or-suspended`
			);
		}

		// --- 5. GENERACIÓN DE SESIÓN DE LIFEBIT ---
		// Creamos el payload para nuestros propios tokens JWT.
		const payload = {
			id: usuario.id,
			rol: usuario.rol,
			id_edificio: usuario.id_edificio_actual,
		};
		const { accessToken, refreshToken } = generaTokens(payload);

		// Enviamos el refreshToken en una cookie segura.
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
		});

		// Finalmente, redirigimos al usuario al frontend, a una ruta de callback
		// especial, pasándole el accessToken en la URL para que lo guarde.
		return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
	} catch (error) {
		// Capturamos cualquier error inesperado del servidor.
		console.error('Error catastrófico en googleCallback:', error);
		return res.redirect(`${process.env.FRONTEND_URL}/login?error=server-error`);
	}
};

/**
 * @route   POST /api/auth/verify-email-change
 * @desc    Verifica un token y finaliza el proceso de cambio de email de un usuario.
 * @access  Public
 */
const verifyEmailChange = async (req, res, next) => {
    try {
        // --- 1. OBTENER Y VALIDAR TOKEN DE ENTRADA ---
        const { token } = req.body;
        if (!token) {
            throw new AppError('No se proporcionó un token de verificación.', 400);
        }

        // --- 2. BUSCAR USUARIO POR TOKEN VÁLIDO ---
        // Hasheamos el token recibido para buscarlo en la base de datos.
        const tokenHasheado = crypto.createHash('sha256').update(token).digest('hex');

        const {
            rows: [usuario],
        } = await db.query(usuarioQueries.OBTENER_USUARIO_POR_TOKEN_CAMBIO_EMAIL, [tokenHasheado]);

        // Si no se encuentra un usuario, el token es inválido, ya fue usado o expiró.
        if (!usuario) {
            throw new AppError('El enlace de verificación es inválido o ha expirado.', 400);
        }

        // --- 3. EJECUTAR LA ACTUALIZACIÓN FINAL ---
        // Si encontramos al usuario, procedemos a hacer el cambio definitivo.
        await db.query(usuarioQueries.CONFIRMAR_CAMBIO_EMAIL, [usuario.id]);
        
        // --- 4. RESPUESTA EXITOSA ---
        res.status(200).json({
            success: true,
            message: 'Tu dirección de email ha sido actualizada exitosamente. Por favor, inicia sesión con tu nuevo email.'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
	register,
	login,
	refreshToken,
	finalizarRegistro,
	forgotPassword,
	resetPassword,
	updatePassword,
	googleCallback,
	logout,
	verifyEmailChange,
};
