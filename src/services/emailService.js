const axios = require('axios');
const AppError = require('../utils/appError');


/**
 * @description Envía un email de invitación usando la API HTTP de Resend.
 * @param {string} destinatarioEmail - La dirección de email del nuevo usuario.
 * @param {string} destinatarioNombre - El nombre del nuevo usuario.
 * @param {string} token - El token de registro de un solo uso.
 * @param {string} nombreEdificio - El nombre del edificio.
 */
const enviarEmailInvitacion = async (
	destinatarioEmail,
	destinatarioNombre,
	token,
	nombreEdificio
) => {
	try {
		const apiKey = process.env.RESEND_API_KEY;

		if (!apiKey) {
			console.error(
				'Error de configuración: La clave RESEND_API_KEY no está definida en .env'
			);
			throw new AppError(
				'El servicio de email no está configurado correctamente.',
				500
			);
		}
		const urlRegistro = `${process.env.URL_BASE}:${process.env.PORT}/finalizar-registro?token=${token}`;
		const añoActual = new Date().getFullYear();
		// Definimos el contenido del email.
		const payload = {
			// remitente
			from: `"El Equipo de LifeBit" <onboarding@resend.dev>`,
			// destinatario
			to: [destinatarioEmail],
			// asunto
			subject: `✅ ¡Tu acceso a LifeBit para ${nombreEdificio} ha sido aprobado!`,
			html: `
                <div style="width: 100%; background-color: #f4f4f4; padding: 20px 0;">
                    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        
                        <div style="text-align: center; margin-bottom: 30px;">
                            <!-- Aquí iría el logo de LifeBit si tuviéramos la URL -->
                            <h1 style="color: #2c3e50; font-family: Arial, sans-serif; font-size: 28px;">LifeBit</h1>
                        </div>
                        
                        <h2 style="color: #34495e; font-family: Arial, sans-serif; font-size: 24px;">¡Felicidades, ${destinatarioNombre}!</h2>
                        
                        <p style="font-family: Arial, sans-serif; font-size: 16px; color: #555; line-height: 1.6;">
                            Tu solicitud para gestionar el edificio <strong>${nombreEdificio}</strong> ha sido aprobada.
                            Estás a un solo paso de transformar la administración de tu condominio y llevar la claridad y eficiencia a tu comunidad.
                        </p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${urlRegistro}" target="_blank" style="background-color: #0053b3; color: #ffffff; padding: 15px 30px; text-align: center; text-decoration: none; display: inline-block; border-radius: 8px; font-size: 18px; font-weight: bold;">
                                Activar mi Cuenta y Establecer Contraseña
                            </a>
                        </div>
                        
                        <p style="font-family: Arial, sans-serif; font-size: 14px; color: #7f8c8d; text-align: center;">
                            <em>Por tu seguridad, este enlace de activación personal es válido por las próximas 24 horas.</em>
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 40px 0;">
                        
                        <p style="font-family: Arial, sans-serif; font-size: 12px; color: #95a5a6;">
                            Si no solicitaste acceso a LifeBit, puedes ignorar este correo de forma segura.
                            <br>
                            © ${añoActual} LifeBit. Todos los derechos reservados.
                        </p>
                        
                    </div>
                </div>
            `,
		};

		// Realizamos la petición POST a la API de Resend.
		await axios.post('https://api.resend.com/emails', payload, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});
		console.log(
			`✅ Email de invitación (vía Resend API) enviado exitosamente a ${destinatarioEmail}`
		);


	} catch (error) {
		// Si el envío falla, registramos el error y lo relanzamos
		// para que el controlador que llamó a esta función sepa que algo salió mal.
		console.error(
			`❌ Error al enviar email vía Resend API a ${destinatarioEmail}:`,
			error.response ? error.response.data : error.message
		);
		throw new AppError('El email de invitación no pudo ser enviado.', 500);
	}
};

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