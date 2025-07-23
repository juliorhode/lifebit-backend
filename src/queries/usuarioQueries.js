const CREA_USUARIO_INVITADO = `insert into usuarios (nombre,apellido,email,telefono,cedula,id_edificio_actual,estado,token_registro,token_registro_expira,rol ) values($1, $2, $3, $4, $5, $6, 'invitado', $7, $8, $9 ) returning id, nombre, email`;

// Busca un usuario por su token de registro hasheado y verifica que no haya expirado.
// ::varchar Es un "type cast" en PostgreSQL. Le estamos diciendo explícitamente: "PostgreSQL, quiero que trates el parámetro $1 como si fuera un VARCHAR, sin ninguna duda ni ambigüedad". Esto previene que el planificador de consultas se confunda.
const OBTENER_INVITADO_POR_TOKEN = `SELECT * FROM usuarios WHERE token_registro = $1 AND token_registro_expira > NOW()`;

// Activa al usuario: establece la contraseña, cambia el estado y limpia los tokens.
const ACTIVAR_USUARIO = `
    UPDATE usuarios
    SET contraseña = $1, estado = 'activo', token_registro = NULL, token_registro_expira = NULL
    WHERE id = $2;
`;

module.exports = {
    CREA_USUARIO_INVITADO,
    OBTENER_INVITADO_POR_TOKEN,
    ACTIVAR_USUARIO
}