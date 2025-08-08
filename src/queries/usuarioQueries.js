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
module.exports = {
    CREA_USUARIO_INVITADO,
    OBTENER_INVITADO_POR_TOKEN,
    ACTIVAR_USUARIO,
    OBTENER_USUARIOS_POR_EMAILS,
    GET_USUARIOS_EXISTENTES_POR_EMAIL_O_CEDULA,
    CREA_USUARIOS_MASIVO,
}