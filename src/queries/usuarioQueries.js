/**
 * @description Multi Proposito: El dueño crea al usuario administrador que se obtiene de todas las solicitudes pendientes de aprobación. El administrador crea el usuario para el residente. Esto es para el pre-registro insertando un nuevo usuario con estado 'invitado'
 */
const CREA_USUARIO_INVITADO = `insert into usuarios (nombre,apellido,email,telefono,cedula,id_edificio_actual,estado,token_registro,token_registro_expira,rol,id_unidad_actual ) values($1, $2, $3, $4, $5, $6, 'invitado', $7, $8, $9, $10) returning id, nombre, email`;

/**
 * @description Plantilla para la inserción masiva de usuarios.
 * %L será reemplazado por pg-format con una lista de valores.
 * La lista de columnas DEBE coincidir con el orden de los valores en el controlador.
 */
const CREA_USUARIOS_MASIVO = `
    INSERT INTO usuarios (
        nombre, apellido, email, telefono, cedula, 
        id_edificio_actual, token_registro, token_registro_expira, 
        rol, id_unidad_actual, estado
    ) VALUES %L;
`;

/**
 * @description Busca un usuario por su token de registro hasheado y verifica que no haya expirado.
::varchar Es un "type cast" en PostgreSQL. Le estamos diciendo explícitamente: "PostgreSQL, quiero que trates el parámetro $1 como si fuera un VARCHAR, sin ninguna duda ni ambigüedad". Esto previene que el planificador de consultas se confunda.
 */
const OBTENER_INVITADO_POR_TOKEN = `SELECT * FROM usuarios WHERE token_registro = $1 AND token_registro_expira > NOW()`;

/**
 * @description Activa al usuario: establece la contraseña, cambia el estado y limpia los tokens.
 */
const ACTIVAR_USUARIO = `
    UPDATE usuarios
    SET contraseña = $1, estado = 'activo', token_registro = NULL, token_registro_expira = NULL
    WHERE id = $2;
`;

const OBTENER_USUARIOS_POR_EMAILS = `SELECT email FROM usuarios WHERE email = ANY($1::varchar[]);`;

/**
 * @description Obtiene usuarios existentes basándose en una lista de emails O una lista de cédulas.
 * Usado para la validación de duplicados en cargas masivas.
 * Devuelve los emails y cédulas encontrados para poder compararlos.
 */
const GET_USUARIOS_EXISTENTES_POR_EMAIL_O_CEDULA = `
    SELECT email, cedula FROM usuarios 
    WHERE email = ANY($1::varchar[]) OR (cedula IS NOT NULL AND cedula = ANY($2::varchar[]));
`;

/**
 * @description Busca a un usuario activo por su dirección de email.
 */
const OBTENER_USUARIO_ACTIVO_POR_EMAIL = `
    SELECT id, nombre, apellido, email FROM usuarios WHERE email = $1 AND estado = 'activo';
`;

/**
 * @description Obtiene el registro completo de un usuario por su ID de LifeBit.
 * Usado para obtener el estado más reciente de un usuario antes de una operación.
 */
const OBTENER_USUARIO_POR_ID = `SELECT * FROM usuarios WHERE id = $1;`;

/**
 * @description Guarda el token de reseteo de contraseña y su expiración para un usuario.
 */
const GUARDAR_TOKEN_RESETEO = `
    UPDATE usuarios SET token_reseteo_pass = $1, token_reseteo_expira = $2 WHERE id = $3;
`;

/**
 * @description Busca un usuario por un token de reseteo válido.
 */
const OBTENER_USUARIO_POR_TOKEN_RESETEO = `
    SELECT * FROM usuarios WHERE token_reseteo_pass = $1 AND token_reseteo_expira > NOW();
`;

/**
 * @description Actualiza la contraseña de un usuario y limpia los tokens de reseteo.
 */
const RESETEAR_CONTRASENA = `
    UPDATE usuarios
    SET contraseña = $1, token_reseteo_pass = NULL, token_reseteo_expira = NULL, fecha_actualizacion = NOW()
    WHERE id = $2;
`;

/**
 * @description Obtiene el hash de la contraseña actual de un usuario por su ID.
 * Para verificar la contraseña actual antes de permitir un cambio.
 */
const OBTENER_CONTRASENA_POR_ID = `SELECT contraseña FROM usuarios WHERE id = $1;`;

/**
 * @description Actualiza únicamente la contraseña de un usuario.
 */
const ACTUALIZAR_CONTRASENA = `
    UPDATE usuarios SET contraseña = $1, fecha_actualizacion = NOW() WHERE id = $2;
`;

/**
 * @description Obtiene un usuario por su google_id único.
 * Usado para el flujo de login con Google.
 */
const OBTENER_USUARIO_POR_GOOGLE_ID = `SELECT * FROM usuarios WHERE google_id = $1;`;

/**
 * @description Obtiene un usuario ACTIVO por su email que aún NO ha vinculado Google. Para vinculaciones.
 */
const OBTENER_USUARIO_ACTIVO_POR_EMAIL_SIN_GOOGLE = `
    SELECT * FROM usuarios WHERE email = $1 AND estado = 'activo' AND google_id IS NULL;
`;

/**
 * @description Vincula un google_id y actualiza el avatar de una cuenta existente.
 */
const VINCULAR_GOOGLE_ID = `
    UPDATE usuarios
        SET
            google_id = $1,
            avatar_url = $2,
            fecha_actualizacion = NOW()
    WHERE id = $3
    RETURNING *;
`;

/**
 * @description Obtiene un usuario con estado 'invitado' por su email,
 * pero SOLO si su token de invitación no ha expirado.
 */
const OBTENER_INVITADO_POR_EMAIL = `
    SELECT * FROM usuarios 
    WHERE email = $1 AND estado = 'invitado' AND token_registro_expira > NOW();
`;

/**
 * @description Activa a un usuario invitado y vincula su google_id y actualiza su avatar.
 * Se usa después de una activación exitosa con Google.
 */
const ACTIVAR_Y_VINCULAR_GOOGLE = `
    UPDATE usuarios 
    SET 
        google_id = $1,
        avatar_url = $2,
        estado = 'activo',
        contraseña = NULL,
        token_registro = NULL, 
        token_registro_expira = NULL,
        fecha_actualizacion = NOW()
    WHERE id = $3 
    RETURNING *;
`;

/**
 * @description Desvincula la cuenta de Google de un usuario estableciendo google_id a NULL.
 */
const DESVINCULAR_GOOGLE_ID = `
    UPDATE usuarios SET google_id = NULL, fecha_actualizacion = NOW() WHERE id = $1 RETURNING id, google_id;
`;

/**
 * @description Actualiza los datos de perfil de un usuario (nombre, apellido, cédula, teléfono, avatar).
 * Es seguro porque solo actualiza el registro correspondiente al ID del usuario autenticado.
 * Devuelve el registro actualizado para evitar una segunda consulta a la BD.
 */
const ACTUALIZAR_PERFIL_USUARIO = `
  UPDATE usuarios
  SET 
    nombre = $2,
    apellido = $3,
    cedula = $4,
    telefono = $5,
    avatar_url = $6,
    fecha_actualizacion = NOW()
  WHERE id = $1
  RETURNING 
    id,
    nombre,
    apellido,
    email,
    telefono,
    cedula,
    id_unidad_actual,
    avatar_url,
    estado,
    rol,
    id_edificio_actual;
`;

module.exports = {
	CREA_USUARIO_INVITADO,
	OBTENER_INVITADO_POR_TOKEN,
	ACTIVAR_USUARIO,
	OBTENER_USUARIOS_POR_EMAILS,
	GET_USUARIOS_EXISTENTES_POR_EMAIL_O_CEDULA,
	CREA_USUARIOS_MASIVO,
	OBTENER_USUARIO_ACTIVO_POR_EMAIL,
	GUARDAR_TOKEN_RESETEO,
	OBTENER_USUARIO_POR_TOKEN_RESETEO,
	RESETEAR_CONTRASENA,
	OBTENER_CONTRASENA_POR_ID,
	ACTUALIZAR_CONTRASENA,
	OBTENER_USUARIO_POR_GOOGLE_ID,
	OBTENER_INVITADO_POR_EMAIL,
	ACTIVAR_Y_VINCULAR_GOOGLE,
	DESVINCULAR_GOOGLE_ID,
	VINCULAR_GOOGLE_ID,
	OBTENER_USUARIO_ACTIVO_POR_EMAIL_SIN_GOOGLE,
	OBTENER_USUARIO_POR_ID,
	ACTUALIZAR_PERFIL_USUARIO, 
};
