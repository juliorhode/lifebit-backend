const OBTENER_TODOS_EDIFICIO = 'SELECT * FROM edificios ORDER BY id ASC'
const OBTENER_EDIFICIO_POR_ID = 'SELECT * FROM edificios WHERE id = $1'

const CREA_EDIFICIO =
	`insert into edificios (nombre, direccion,id_contrato,moneda_funcional) VALUES ($1, $2, $3, 'USD') RETURNING *`

const ACTUALIZA_EDIFICIO =
	'UPDATE edificios SET nombre = $1, direccion = $2, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *'
const BORRA_EDIFICIO = 'DELETE FROM edificios WHERE id = $1 RETURNING *'

/**
 * @description Busca un edificio por su nombre, ignorando mayúsculas/minúsculas.
 * Usado para prevenir la creación de edificios duplicados.
 */
const OBTENER_EDIFICIO_POR_NOMBRE_ILIKE = `
    SELECT id, nombre FROM edificios WHERE nombre ILIKE $1;
`;

const ACTUALIZA_ESTADO_CONFIGURACION = `
    UPDATE edificios SET estado_configuracion = $1 WHERE id = $2;
`;

module.exports = {
	OBTENER_TODOS_EDIFICIO,
	OBTENER_EDIFICIO_POR_ID,
	CREA_EDIFICIO,
	ACTUALIZA_EDIFICIO,
	BORRA_EDIFICIO,
	OBTENER_EDIFICIO_POR_NOMBRE_ILIKE,
	ACTUALIZA_ESTADO_CONFIGURACION
}
