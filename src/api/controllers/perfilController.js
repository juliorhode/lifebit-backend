const db = require('../../config/db');
const AppError = require('../../utils/appError');
const usuarioQueries = require('../../queries/usuarioQueries');
const bcrypt = require('bcrypt');
const tokenUtils = require('../../utils/tokenUtils');
const trabajoQueries = require('../../queries/trabajoQueries');
const format = require('pg-format');

/**
 * @description Obtiene el perfil completo del usuario actualmente autenticado.
 * @route GET /api/perfil/me
 * @access Private (requiere token)
 */
const obtenerPerfil = (req, res, next) => {
	// La información del usuario ya fue cargada por el middleware 'protegeRuta'.
	// No necesitamos buscarlo en la base de datos de nuevo aquí.
	res.status(200).json({
		success: true,
		data: {
			user: req.user,
		},
	});
};

/**
 * @route   PATCH /api/perfil/me
 * @desc    Actualiza los datos personales del usuario autenticado.
 *          Permite la modificación parcial de: nombre, apellido, cédula, teléfono y avatar.
 *          Es seguro y flexible gracias al uso del método PATCH.
 * @access  Private
 */
const actualizarPerfil = async (req, res, next) => {
    try {
        // --- 1. OBTENER IDENTIDAD SEGURA ---
        // La identidad del usuario (ID) es la del token, garantizada por `protegeRuta`.
        const idUsuario = req.user.id;

        // --- 2. VALIDACIÓN Y PREPARACIÓN DE DATOS ---
        // Extraemos todos los campos potencialmente actualizables del `req.body`.
        const { nombre, apellido, cedula, telefono, avatar_url } = req.body;
        
        // Obtenemos el estado actual del usuario desde `req.user` para usarlo como fallback.
        // Esto es el corazón de la lógica PATCH: si un campo no se envía, no se cambia.
        const { 
            nombre: nombreActual, 
            apellido: apellidoActual, 
            cedula: cedulaActual, 
            telefono: telefonoActual, 
            avatar_url: avatarActual 
        } = req.user;

        // Construimos el objeto de datos a actualizar, usando los nuevos valores si existen,
        // o manteniendo los actuales si no. Usamos `.trim()` para limpiar strings.
        const datosAActualizar = {
            nombre: nombre !== undefined ? nombre.trim() : nombreActual,
            apellido: apellido !== undefined ? apellido.trim() : apellidoActual,
            cedula: cedula !== undefined ? cedula.trim() : cedulaActual,
            telefono: telefono !== undefined ? telefono.trim() : telefonoActual,
            avatar_url: avatar_url !== undefined ? avatar_url.trim() : avatarActual,
        };

        // Reglas de negocio: El nombre y el apellido son obligatorios y no pueden ser vacíos.
        if (!datosAActualizar.nombre || !datosAActualizar.apellido) {
            throw new AppError('El nombre y el apellido no pueden estar vacíos.', 400);
        }

        // --- 3. EJECUTAR LA ACCIÓN EN LA BD ---
        // Preparamos los parámetros para la query. ¡EL ORDEN ES CRÍTICO!
        // Debe coincidir exactamente con los placeholders ($1, $2, ...) de la query SQL.
        const queryParams = [
            idUsuario, // $1
            datosAActualizar.nombre, // $2
            datosAActualizar.apellido, // $3
            datosAActualizar.cedula, // $4
            datosAActualizar.telefono, // $5
            datosAActualizar.avatar_url, // $6
        ];

        const {
            rows: [usuarioActualizado],
        } = await db.query(usuarioQueries.ACTUALIZAR_PERFIL_USUARIO, queryParams);

        // --- 4. RESPUESTA EXITOSA ---
        // Enviamos la respuesta al cliente con el objeto de usuario ya actualizado.
        res.status(200).json({
            success: true,
            message: 'Tu perfil ha sido actualizado exitosamente.',
            data: {
                user: usuarioActualizado,
            },
        });
    } catch (error) {
        // Cualquier error es delegado a nuestro manejador central.
        next(error);
    }
};

/**
 * @route   POST /api/perfil/verify-password
 * @desc    Verifica la contraseña actual del usuario para autorizar acciones sensibles.
 * @access  Private
 */
const verifyPassword = async (req, res, next) => {
    try {
        // --- 1. OBTENER DATOS Y VALIDAR ENTRADA ---
        const { contraseña } = req.body;
        if (!contraseña) {
            throw new AppError('Por favor, proporciona tu contraseña actual.', 400);
        }

        // --- 2. OBTENER IDENTIDAD SEGURA ---
        // La identidad (ID) del usuario se obtiene del token verificado por `protegeRuta`.
        const idUsuario = req.user.id;

        // --- 3. OBTENER HASH DE LA CONTRASEÑA DE LA BD ---
        // Obtenemos el hash actual de la contraseña desde la base de datos.
        // Es más seguro que obtener el registro completo del usuario si solo necesitamos la contraseña.
        const {
            rows: [usuario],
        } = await db.query(usuarioQueries.OBTENER_CONTRASENA_POR_ID, [idUsuario]);

        // Verificamos si el usuario existe y tiene una contraseña establecida (podría ser un usuario de Google).
        if (!usuario || !usuario.contraseña) {
            throw new AppError('No tienes una contraseña de LifeBit establecida. Por favor, crea una primero.', 403);
        }

        // --- 4. COMPARAR CONTRASEÑAS DE FORMA SEGURA ---
        // Usamos bcrypt.compare para comparar la contraseña en texto plano enviada por el usuario
        // con el hash almacenado en la base de datos.
        const esCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!esCorrecta) {
            // Si la contraseña no coincide, enviamos un error 401 Unauthorized.
            throw new AppError('La contraseña proporcionada es incorrecta.', 401);
        }

        // --- 5. RESPUESTA EXITOSA ---
        // Si la contraseña es correcta, respondemos con éxito.
        // El frontend usará esta respuesta para permitir al usuario continuar con la acción sensible.
        res.status(200).json({
            success: true,
            message: 'Contraseña verificada correctamente.',
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/perfil/request-email-change
 * @desc    Inicia el proceso de cambio de email para el usuario autenticado.
 * @access  Private
 */
const requestEmailChange = async (req, res, next) => {
    try {
		// --- 1. OBTENER DATOS Y VALIDAR ENTRADA ---
        const { nuevoEmail } = req.body;
        console.log('Nuevo email recibido:', nuevoEmail);
        console.log('Cuerpo de la solicitud:', req.body);
        
		if (!nuevoEmail) {
			throw new AppError('Por favor, proporciona la nueva direccion de email.', 400);
		}
		// --- 2. OBTENER IDENTIDAD SEGURA ---
		const idUsuario = req.user.id;
		const nombreUsuario = req.user.nombre;
		const emailAntiguo = req.user.email;
		if (nuevoEmail.toLowerCase() === emailAntiguo.toLowerCase()) {
			throw new AppError(
				'La nueva dirección de email no puede ser la misma que la actual.',
				400
			);
		}
		// --- 3. VERIFICAR QUE EL NUEVO EMAIL NO ESTÉ EN USO ---
		const {
			rows: [usuarioExistente],
		} = await db.query(usuarioQueries.OBTENER_USUARIO_POR_EMAIL, [nuevoEmail]);
		if (usuarioExistente) {
			throw new AppError(
				'La dirección de email proporcionada ya está en uso por otro usuario.',
				409
			); // 409 Conflict
		}
		// --- 4. GENERAR TOKEN Y FECHA DE EXPIRACIÓN ---
		const { tokenPlano, tokenHasheado } = tokenUtils.generaTokenRegistro();
		// El token será válido por 15 minutos.
		const tokenExpira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos en el futuro

		// --- 5. GUARDAR LA SOLICITUD EN LA BASE DE DATOS ---
		await db.query(usuarioQueries.GUARDAR_SOLICITUD_CAMBIO_EMAIL, [
			nuevoEmail,
			tokenHasheado,
			tokenExpira,
			idUsuario,
		]);
        // --- 6. ENCOLAR LOS TRABAJOS DE ENVÍO DE EMAIL ---
        const payloadAlerta = {
			destinatarioEmail: emailAntiguo,
			destinatarioNombre: nombreUsuario,
			nuevoEmail: nuevoEmail,
		};
		const payloadVerificacion = {
			destinatarioEmail: nuevoEmail,
			destinatarioNombre: nombreUsuario,
			token: tokenPlano,
		};

		const trabajos = [
			['enviar_alerta_cambio_email', JSON.stringify(payloadAlerta)],
			['enviar_verificacion_nuevo_email', JSON.stringify(payloadVerificacion)],
		];

		const sql = format(trabajoQueries.CREA_TRABAJOS_MASIVO, trabajos);
		await db.query(sql);

		// --- 7. RESPONDER AL CLIENTE ---
		res.status(200).json({
			success: true,
			message:
				'Solicitud recibida. Hemos enviado un email de verificación a tu nueva dirección. Por favor, revisa tu bandeja de entrada.',
		});
	} catch (error) {
        // Manejamos el caso de que dos usuarios intenten cambiar al mismo email pendiente.
        if (error.code === '23505' && error.constraint === 'usuarios_nuevo_email_pendiente_key') {
             return next(new AppError('Esa dirección de email ya está siendo verificada por otro usuario. Por favor, elige otra.', 409));
        }
		next(error);
	}
};

/**
 * @description Desvincula la cuenta de Google del usuario actualmente autenticado.
 * Impone la regla de negocio de que un usuario no puede desvincular Google
 * si no tiene una contraseña de LifeBit establecida.
 * @route POST /api/perfil/google/desvincular
 * @access Private
 */
const desvinculaGoogle = async (req, res, next) => {
    
	try {
		// 1. OBTENER IDENTIDAD SEGURA
		// La identidad del usuario (su ID) se obtiene del token procesado por 'protegeRuta'.
        const idUsuario = req.user.id;
        
        // Depuración básica para asegurar que tenemos el ID correcto.
        console.log('--- DEPURANDO DESVINCULAR ---');
		console.log('ID de Usuario a desvincular:', idUsuario);
		console.log('Tipo de dato:', typeof idUsuario);
		console.log('Query a ejecutar:', usuarioQueries.DESVINCULAR_GOOGLE_ID);
		console.log('----------------------------');

		// 2. OBTENER ESTADO ACTUAL DEL USUARIO
		// Hacemos una consulta a la BD para obtener el registro completo y más reciente del usuario.
		// Esto es crucial para verificar el estado de las columnas 'google_id' y 'contraseña'.
		const {
			rows: [usuario],
		} = await db.query(usuarioQueries.OBTENER_USUARIO_POR_ID, [idUsuario]);

		// 3. VALIDACIONES DE NEGOCIO Y SEGURIDAD
		// Verificamos si la cuenta ya está desvinculada para evitar operaciones innecesarias.
		if (!usuario.google_id) {
			throw new AppError('Tu cuenta no está actualmente vinculada a Google.', 400);
		}

		// La regla de negocio más importante: No permitir que un usuario se quede "encerrado".
		if (!usuario.contraseña) {
			throw new AppError(
				'No puedes desvincular tu cuenta de Google porque no tienes una contraseña de LifeBit establecida. Por favor, utiliza la opción "Establecer Contraseña" primero.',
				403 // 403 Forbidden: Acción prohibida por una regla de negocio.
			);
		}

		// 4. EJECUTAR LA ACCIÓN
		// Si todas las validaciones pasan, procedemos a actualizar la base de datos.
		await db.query(usuarioQueries.DESVINCULAR_GOOGLE_ID, [idUsuario]);

		// 5. RESPUESTA EXITOSA
		res.status(200).json({
			success: true,
			message:
				'Tu cuenta de Google ha sido desvinculada exitosamente. A partir de ahora, solo podrás iniciar sesión con tu email y contraseña.',
		});
	} catch (error) {
		// Pasamos cualquier error inesperado al manejador global.
		next(error);
	}
};

module.exports = {
	obtenerPerfil,
	desvinculaGoogle,
    actualizarPerfil,
    verifyPassword,
    requestEmailChange,
};
