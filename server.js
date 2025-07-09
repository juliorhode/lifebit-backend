// --- server.js ---
// El ÚNICO propósito de este archivo es iniciar el servidor.

// Carga las variables de entorno del archivo .env
// Esto es lo PRIMERO que debe ocurrir.
require('dotenv').config()

// Importamos la aplicación Express que configuramos en src/app.js
// La ruta es './src/app' porque server.js está en la raíz.
const app = require('./src/app')

const db = require('./src/config/db')

// Leemos el puerto desde las variables de entorno.
// Si no está definido en .env, usamos 3000 como valor por defecto.
const PORT = process.env.PORT || 3000

// Ahora sí, aquí es donde iniciamos el servidor.
const server = app.listen(PORT, async () => {
	console.log(`✅ Servidor de LifeBit corriendo en el puerto: ${PORT}`)
	try {
		// Hacemos una consulta simple para verificar la conexión.
		// 'SELECT NOW()' es una consulta estándar de PostgreSQL que devuelve la hora actual.
		const result = await db.query('select now()')
		console.log(
			`✅  Conexion a la base de datos exiosa. Hora del servidor DB: ${result.rows[0].now}`
		)
	} catch (error) {
		console.log(
			'❌ No se pudo conectar a la base de datos al iniciar',
			error
		)
		// Si la BD no está disponible, no tiene sentido que el servidor siga corriendo.
		process.exit(1)
	}
})

// Manejo de errores no capturados (promesas rechazadas)
// Esto es una red de seguridad extra para evitar que el servidor se caiga
// ante un error inesperado, por ejemplo, si la base de datos no está disponible.
process.on('unhandledRejection', (err) => {
	console.error('❌ RECHAZO NO MANEJADO! Cerrando el servidor...')
	console.error(err.name, err.message)
	server.close(() => {
		process.exit(1) // 1 indica una salida con error.
	})
})
