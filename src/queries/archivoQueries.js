const INSERT_ARCHIVO = `INSERT INTO archivos (nombre_original, url_recurso, mime_type, tamaño_bytes, id_usuario_subio) VALUES ($1, $2, $3, $4, $5) RETURNING id;`
// Nota: id_usuario_subio será NULL por ahora, ya que el solicitante no es un usuario aún.
// Lo manejaremos en el controlador.

module.exports = {
    INSERT_ARCHIVO
}