// Selecciona los campos más importantes de las solicitudes pendientes.
// Ordenamos por fecha para ver las más antiguas primero.
const OBTENER_SOLICITUDES_PENDIENTES = `select id,nombre_solicitante,email_solicitante,nombre_edificio,estado,fecha_solicitud from solicitudes_servicio where estado = 'pendiente' order by fecha_solicitud asc`

module.exports = {
    OBTENER_SOLICITUDES_PENDIENTES
}