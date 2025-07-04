// El estado se establece en 'activo' porque este es un registro voluntario,
// a diferencia de una invitación donde el estado inicial sería 'invitado'.
// RETURNING nos devuelve los datos clave del usuario recién creado para confirmar el éxito.
const CREA_USUARIO = `
  INSERT INTO usuarios (nombre, apellido, email, contraseña, telefono, cedula, estado) 
  VALUES ($1, $2, $3, $4, $5, $6, 'activo') RETURNING id, nombre, email, estado;`

// Exportamos la consulta corregida.
module.exports = {
	CREA_USUARIO,
}
