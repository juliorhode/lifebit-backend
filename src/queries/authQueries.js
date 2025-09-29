/**
 * @description Creacion de usuario. Los estados de un usuario: 'invitado', 'activo', 'suspendido' (por defecto es 'invitado'). RETURNING nos devuelve los datos clave del usuario recién creado para confirmar el éxito.
 * 
 */
const CREA_USUARIO = `
  insert into usuarios (nombre, apellido, email, contraseña, telefono, cedula) 
  values ($1, $2, $3, $4, $5, $6) returning id, nombre, email, estado;`;

/**
 * @description verifica si el usuario ya existe
 */
const USUARIO_EXISTE = `select id, nombre, apellido, email, contraseña, telefono, cedula, rol, avatar_url from usuarios where email = $1`;

/**
 * @description Obtiene los datos de un usuario para la autenticación y
 * autorización que viajan en el token, como tambien el estado de configuración actual del edificio. Usado por el middleware 'protegeRuta'
 */
const USUARIO_TOKEN = `
    SELECT 
        u.id, 
        u.nombre,
        u.apellido,
        u.email,
        u.estado, 
        u.rol,
        u.avatar_url,
        u.id_edificio_actual,
        e.nombre AS nombre_edificio,
        e.estado_configuracion
    FROM usuarios AS u
    LEFT JOIN edificios AS e ON u.id_edificio_actual = e.id
    WHERE u.id = $1;
`;

/**
 * @description Actualizar el estado del usuario a activo al hacer login por primera vez
 */
const LOGIN_USUARIO = `UPDATE usuarios SET estado = 'activo' WHERE id = $1`;

// Exportamos la consulta corregida.
module.exports = {
	CREA_USUARIO,
	USUARIO_EXISTE,
	USUARIO_TOKEN,
	LOGIN_USUARIO,
};
