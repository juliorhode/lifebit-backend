// Cargamos las variables de entorno al principio
const path = require('path') // Importamos el módulo 'path'
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') })

// Verificación inmediata para asegurarnos de que las variables se cargaron
if (!process.env.SUPERADMIN_EMAIL) {
	console.error(
		'ERROR: Las variables de entorno no se cargaron correctamente. Verifica la ruta en dotenv.config().'
	)
	process.exit(1) // Salimos con un código de error
}

const bcrypt = require('bcrypt')
const db = require('../../config/db')
const queries = require('../../queries/setupQueries')

/**
 * @description Siembra el usuario dueño_app si no existe.
 * @param {object} cliente - Un cliente de la base de datos obtenido del pool.
 */
const seedDueñoApp = async (cliente) => {
	console.log('--- Iniciando script de siembra del superadministrador ---')

	const {
		SUPERADMIN_EMAIL,
		SUPERADMIN_PASSWORD,
		SUPERADMIN_NOMBRE,
		SUPERADMIN_APELLIDO,
		SUPERADMIN_CEDULA,
		SUPERADMIN_TELEFONO,
	} = process.env

	const resultado = await cliente.query(queries.CHECK_USER_EXISTS, [
		SUPERADMIN_EMAIL,
	])
	if (resultado.rowCount > 0) {
		console.log(
			`Usuario dueño_app con email ${SUPERADMIN_EMAIL} ya existe.`
		)
	} else {
		console.log(
			`Creando usuario dueño_app con email ${SUPERADMIN_EMAIL}...`
		)
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, salt)

		const values = [
			SUPERADMIN_NOMBRE,
			SUPERADMIN_APELLIDO,
			SUPERADMIN_EMAIL,
			hashedPassword,
			SUPERADMIN_TELEFONO,
			SUPERADMIN_CEDULA,
		]
		await cliente.query(queries.INSERT_OWNER, values)
		console.log('✅ ¡Usuario dueño_app sembrado exitosamente!')
	}
}

/**
 * @description Siembra las licencias base (planes) si no existen.
 * @param {object} cliente - Un cliente de la base de datos obtenido del pool.
 */
const seedLicencias = async (cliente) => {
	// Verifica si ya hay alguna licencia para no re-insertarlas.
	const resultadoCheck = await cliente.query(queries.CHECK_LICENCIAS_EXIST)

	if (resultadoCheck.rowCount > 0) {
		console.log('Las licencias base ya existen. No se tomarán acciones.')
	} else {
		console.log('Sembrando licencias base (Básico, Gold, Premium)...')
		await cliente.query(queries.INSERT_LICENCIAS_BASE)
		console.log('✅ ¡Licencias base sembradas exitosamente!')
	}
}

/**
 * @description Función principal que orquesta todo el proceso de siembra.
 */
const main = async () => {
	console.log('--- Iniciando script Setup General---');
	const cliente = await db.getClient()
	try {
		// Iniciamos una transacción para todo el proceso.
		await cliente.query('BEGIN')
		// Ejecutamos cada función de siembra en orden.
		await seedDueñoApp(cliente)
		await seedLicencias(cliente)
		// Si todo fue exitoso, confirmamos los cambios.
		await cliente.query('COMMIT')
		console.log('--- Proceso de siembra completado exitosamente. ---')
	} catch (error) {
		// Si algo falla, revertimos todos los cambios.
		await cliente.query('ROLLBACK')
		console.error(
			'❌ Error durante el proceso de siembra. Se revirtieron los cambios.',
			error.message
		)
	} finally {
		// Liberamos el cliente y cerramos el pool.
		if (cliente) cliente.release();
		if (db.pool) db.pool.end();
		console.log('--- Conexión de siembra cerrada. ---');
	}
}

// Ejecutamos la función principal.
main()