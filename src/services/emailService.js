const nodemailer = require('nodemailer')
const trasnporter = require('../config/mailer')

/**
 * @description Envía un email de invitación para finalizar el registro.
 * @param {string} destinatarioEmail - La dirección de email del nuevo usuario.
 * @param {string} destinatarioNombre - El nombre del nuevo usuario.
 * @param {string} token - El token de registro de un solo uso.
 */
const enviarEmailInvitacion = async (
	destinatarioEmail,
	destinatarioNombre,
	token
) => {
	try {
		const urlRegistro = `${process.env.URL_BASE}:${process.env.PORT}/finalizar-registro?token=${token}`

		// Definimos el contenido del email.
		const opcionesEmail = {
			// remitente
			from: `"LifeBit" <${process.env.EMAIL_USER}>`,
			// destinatario
			to: destinatarioEmail,
			// asunto
			subject: '¡Bienvenido a LifeBit! Finaliza tu registo',
			// Usamos la propiedad 'html' para enviar un email con formato.
			html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>¡Hola, ${destinatarioNombre}!</h2>
                    <p>Has sido invitado a unirte a la plataforma LifeBit.</p>
                    <p>Para activar tu cuenta y establecer tu contraseña, por favor haz clic en el siguiente botón:</p>
                    <a href="${urlRegistro}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px; font-size: 16px;">
                        Activar Mi Cuenta
                    </a>
                    <p>Este enlace es válido por 24 horas.</p>
                    <p>Si no has solicitado esta invitación, puedes ignorar este correo de forma segura.</p>
                    <br>
                    <p>Saludos,</p>
                    <p>El equipo de LifeBit</p>
                </div>
            `,
		}
		// Usamos nuestro transportador para enviar el email.
		// La función 'sendMail' devuelve una promesa, por lo que usamos 'await'.
		await trasnporter.sendMail(opcionesEmail)
		console.log(
			`✅ Email de invitación enviado exitosamente a ${destinatarioEmail}`
		)
	} catch (error) {
		// Si el envío falla, registramos el error y lo relanzamos
		// para que el controlador que llamó a esta función sepa que algo salió mal.
		console.error(
			`❌ Error al enviar el email de invitación a ${destinatarioEmail}:`,
			error
		)
		throw new Error('El email de invitación no pudo ser enviado.')
	}
}

module.exports = {enviarEmailInvitacion}


// --- Bloque de Prueba Temporal ---
/* const prueba = async () => {
	console.log('Iniciando prueba de envío de email...')
	try {
		await enviarEmailInvitacion(
			'rhodejulio@gmail.com',
			'Julio Rhode',
			'un-token-de-prueba-123'
		)
		console.log('Prueba finalizada.')
	} catch (error) {
		console.error('La prueba de envío de email falló:', error.message)
	}
}

prueba() */