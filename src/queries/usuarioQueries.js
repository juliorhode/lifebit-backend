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
const OBTENER_USUARIO_POR_GOOGLE_ID = `SELECT * FROM usuarios WHERE google_id = $1;`;
const OBTENER_INVITADO_POR_EMAIL = `SELECT * FROM usuarios WHERE email = $1 AND estado = 'invitado';`;
const ACTIVAR_Y_VINCULAR_GOOGLE = `
    UPDATE usuarios 
    SET 
        google_id = $1, 
        estado = 'activo',
        contraseña = NULL,
        token_registro = NULL, 
        token_registro_expira = NULL,
        fecha_actualizacion = NOW()
    WHERE id = $2 
    RETURNING *;
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

}