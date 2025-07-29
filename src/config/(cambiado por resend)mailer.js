const nodemailer = require('nodemailer');

// 1. Creamos el objeto 'transportador' usando la configuración de nuestro .env
const transporter = nodemailer.createTransport({
	// Usamos el servicio de Gmail, que Nodemailer conoce bien.
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT,
	// secure: true --> La conexión debe ser segura (TLS).
	secure: true,
	// 'auth' contiene nuestras credenciales para iniciar sesión en el servidor de correo.
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_APP_PASSWORD,
	},
});
// Verificamos que la conexión con el servidor de correo sea exitosa.
// Es la forma original en que JavaScript maneja las operaciones asíncronas usando Promesas. Se encadenan funciones que se ejecutan cuando la promesa se resuelve (.then()) o se rechaza (.catch()).
// Desventaja: Puede llevar a anidación (el "pyramid of doom") si tienes muchas operaciones asíncronas consecutivas, y mezcla la lógica de éxito y de error en diferentes bloques.
/* transporter
	.verify()
	.then(() => {
		console.log('✅ Nodemailer esta listo para enviar correos')
	})
	.catch((error) => {
		console.log(
			'❌ Error al configurar Nodemailer... Verificar credenciales en .env',
			error
		)
	}) */

/**
 * @description Función asíncrona autoejecutable para verificar la conexión de Nodemailer.
 * Usamos una IIFE (Immediately Invoked Function Expression) asíncrona.
 */
// Es una forma más moderna y legible de trabajar con promesas. La palabra clave async le dice a JavaScript que una función contendrá operaciones asíncronas. La palabra clave await le dice a JavaScript que "pause" la ejecución de la función en esa línea hasta que la promesa se resuelva, y luego continúe, devolviendo el valor resuelto. Los errores se manejan de forma natural con los bloques try...catch estándar de JavaScript.
(async () => {
	try {
		// 'await' pausa la ejecución aquí hasta que 'verify()' termine.
		await transporter.verify();
		console.log('✅ Nodemailer esta listo para enviar correos');
	} catch (error) {
		// Si 'verify()' falla, el error es capturado aquí.
		console.log(
			'❌ Error al configurar Nodemailer... Verificar credenciales en .env',
			error
		);
	}
})(); // Los paréntesis finales '()' ejecutan la función inmediatamente.
// Esto se llama una IIFE (Immediately Invoked Function Expression). Es simplemente una forma de crear una función anónima y ejecutarla inmediatamente, lo que nos permite usar await en el nivel superior de un archivo de módulo, donde normalmente no se podría. Es un patrón limpio para realizar una inicialización asíncrona.

// Exportamos el transportador
module.exports = transporter;

// para probarlo:
// node -r dotenv/config src/config/mailer.js
// El flag -r (o --require) permite precargar un modulo antes de que el script se ejecute
// -r dotenv/config: Le dice a Node: "Oye, antes de que ejecutes cualquier cosa, primero carga y ejecuta el script config de la librería dotenv". Este script está diseñado específicamente para leer tu archivo .env de la raíz del proyecto y poblar process.env.
