const { Pool, Query } = require('pg')

const pool = new Pool({
	// Cada una de estas propiedades lee su valor directamente de 'process.env'
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
})

// Exportamos un objeto que contiene una única función llamada 'query'.
// En lugar de importar y usar el 'pool' en todas partes, solo importaremos este archivo y llamaremos a db.query().
module.exports = {
	query: (text, params) => pool.query(text, params),
}
