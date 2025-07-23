// --- CONFIGURACIÓN INICIAL ---
// Cargar las variables de entorno desde el archivo .env en la raíz del proyecto.
require('dotenv').config({
	path: require('path').resolve(__dirname, '../../.env'),
})

// --- IMPORTACIÓN DE MÓDULOS ---

// Importamos el módulo 'fs' (File System).
// leer el contenido de un archivo.
const fs = require('fs')

// Importamos el módulo 'path'. Nos ayuda a construir rutas a archivos
// y directorios que funcionarán en cualquier sistema operativo
// (Windows, macOS, Linux), evitando problemas con las barras '/' o '\'.
const path = require('path')

// Importamos nuestro objeto 'db' desde la configuración. Este objeto contiene
// el pool de conexiones a PostgreSQL, para enviar comandos a la base de datos.
const db = require('../config/db')

// --- DEFINICIÓN DE LA FUNCIÓN PRINCIPAL ---

/**
 * @description Lee el archivo schema.sql y lo ejecuta en la base de datos para crear todas las tablas.
 * Esta función es asíncrona porque las operaciones con la base de datos toman tiempo.
 */
const runMigration = async () => {
	// Imprimimos un mensaje en la consola para saber que el script ha comenzado.
	// Es una buena práctica para la depuración y seguimiento.
	console.log(
		'--- Iniciando la creación de la estructura de la base de datos ---'
	)

	// Obtenemos un "cliente" del pool de conexiones.
	const client = await db.getClient()

	try {
		// --- LECTURA DEL ARCHIVO SQL ---

		// Construimos la ruta absoluta y segura a nuestro archivo de schema.
		// '__dirname' es una variable global de Node.js que contiene la ruta
		// al directorio donde se encuentra el archivo actual (en este caso, 'src/db').
		// 'path.join' une las partes para formar una ruta válida como '.../src/db/DDL/schema.sql'.
		const schemaPath = path.join(__dirname, 'DDL', 'schema.sql')

		// ANTES de intentar leer, verificamos si el archivo existe.
		// Esta es una comprobación de seguridad para dar un error más claro.
		if (!fs.existsSync(schemaPath)) {
			// Lanzamos un error personalizado que será capturado por el bloque catch.
			throw new Error(
				`No se encontró el archivo schema en la ruta: ${schemaPath}`
			)
		}

		console.log(`Leyendo archivo de schema desde: ${schemaPath}`)

		// Usamos la función síncrona 'readFileSync' de 'fs' para leer el contenido
		// del archivo. El script se detendrá aquí hasta que el archivo se haya leído por completo.
		// 'utf8' es la codificación de caracteres que le dice a Node cómo interpretar los bytes del archivo como texto.
		const sql = fs.readFileSync(schemaPath, 'utf8')

		console.log('Ejecutando script schema.sql...')

		// --- EJECUCIÓN DEL SQL ---

		// Usamos nuestro cliente dedicado para enviar todo el contenido del archivo SQL
		// a la base de datos para su ejecución. El driver 'pg' es capaz de procesar
		// un string que contiene múltiples sentencias SQL separadas por punto y coma.
		await client.query(sql)

		console.log('✅ ¡Estructura de la base de datos creada exitosamente!')
	} catch (error) {
		console.error('❌ Error durante la creación de la estructura:', error)
	} finally {
		// --- LIBERACIÓN DEL CLIENTE ---

		// Este es uno de los pasos más importantes.
		// Si olvidamos esta línea, la conexión se quedaría "ocupada" para siempre,
		// y eventualmente agotaríamos todas las conexiones del pool.
		client.release()
		console.log('Cliente de base de datos liberado.')
	}
}

// --- EJECUCIÓN DEL SCRIPT ---

// Llamamos a la función principal que acabamos de definir.
// Usamos la sintaxis .catch().finally() para manejar el resultado de la promesa.
runMigration()
	// .catch() se ejecutará si la promesa 'runMigration' es rechazada por un error
	.catch((err) =>
		console.error('Error no manejado en el flujo de migración:', err)
	)
	// .finally() se ejecutará después de que la promesa se resuelva (éxito) o se rechace (error).
	.finally(() => {
		console.log('Cerrando el pool de conexiones para finalizar el script.')
		// Cerramos todas las conexiones en el pool. Esto permite que el proceso de Node.js
		// termine de forma limpia. Sin esto, el script se quedaría "colgado" esperando.
		db.pool.end()
	})
