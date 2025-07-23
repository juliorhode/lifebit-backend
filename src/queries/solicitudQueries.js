const INSERT_SOLICITUD = `INSERT INTO solicitudes_servicio (nombre_solicitante, apellido_solicitante,email_solicitante, telefono_solicitante, cedula_solicitante, id_archivo_cedula, nombre_edificio, direccion_edificio, id_documento_condominio, id_licencia_solicitada) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, nombre_solicitante,apellido_solicitante, email_solicitante, estado;`;

// Obtiene una solicitud por su ID, asegurándose de que esté pendiente.
const OBTENER_SOLICITD_POR_ID = `select id,nombre_solicitante,apellido_solicitante,email_solicitante,telefono_solicitante,cedula_solicitante,nombre_edificio,direccion_edificio,estado,fecha_solicitud from solicitudes_servicio where id = $1 and estado = 'pendiente'`;

// Actualiza el estado de una solicitud a 'aprobado'.
const ACTUALIZA_SOLICITUD_ESTADO = `update solicitudes_servicio set estado = 'aprobado' where id = $1`

const OBTENER_SOLICITUDES_PENDIENTES = `select id,nombre_solicitante, apellido_solicitante, email_solicitante,nombre_edificio,estado,fecha_solicitud from solicitudes_servicio where estado = 'pendiente' order by fecha_solicitud asc`;


module.exports = {
	INSERT_SOLICITUD,
	OBTENER_SOLICITD_POR_ID,
	ACTUALIZA_SOLICITUD_ESTADO,
	OBTENER_SOLICITUDES_PENDIENTES,
};
