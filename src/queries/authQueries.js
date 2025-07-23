// estos son los estados de un usuario: 'invitado', 'activo', 'suspendido' (por defecto es 'invitado')
// RETURNING nos devuelve los datos clave del usuario recién creado para confirmar el éxito.
const CREA_USUARIO = `
  insert into usuarios (nombre, apellido, email, contraseña, telefono, cedula) 
  values ($1, $2, $3, $4, $5, $6) returning id, nombre, email, estado;`

// verificamos si el usuario ya existe
const USUARIO_EXISTE = `select id, nombre, apellido, email, contraseña, telefono, cedula from usuarios where email = $1`

// verificamos si el usuario ya existe
// const USUARIO_TOKEN = `select id, nombre, email, estado from usuarios where id = $1`
// ADR-001: Traemos el rol y el id_edificio directamente de la tabla usuarios.
const USUARIO_TOKEN = `select id, nombre, email, estado, rol, id_edificio_actual from usuarios where id = $1`

// Actualizar el estao del usuario a activo al hacer login por primera vez
const LOGIN_USUARIO = `UPDATE usuarios SET estado = 'activo' WHERE id = $1`
// Exportamos la consulta corregida.
module.exports = {
  CREA_USUARIO,
  USUARIO_EXISTE,
  USUARIO_TOKEN,
  LOGIN_USUARIO
}
