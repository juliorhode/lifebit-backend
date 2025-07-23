const CREA_USUARIO_INVITADO = `insert into usuarios (nombre,apellido,email,telefono,cedula,rol,id_edificio_actual,estado,token_registro,token_registro_expira ) values($1, $2, $3, $4, $5, 'administrador', $6, 'invitado', $7, $8 ) returning id, nombre, email`

module.exports = {
    CREA_USUARIO_INVITADO
}