const OBTENER_TODOS_EDIFICIO = 'SELECT * FROM edificios ORDER BY id ASC'
const OBTENER_EDIFICIO_POR_ID = 'SELECT * FROM edificios WHERE id = $1'

const CREA_EDIFICIO =
	`insert into edificios (nombre, direccion,id_contrato,moneda_funcional) VALUES ($1, $2, $3, 'USD') RETURNING *`

const ACTUALIZA_EDIFICIO =
	'UPDATE edificios SET nombre = $1, direccion = $2, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *'
const BORRA_EDIFICIO = 'DELETE FROM edificios WHERE id = $1 RETURNING *'

module.exports = {
	OBTENER_TODOS_EDIFICIO,
	OBTENER_EDIFICIO_POR_ID,
	CREA_EDIFICIO,
	ACTUALIZA_EDIFICIO,
	BORRA_EDIFICIO,
}
