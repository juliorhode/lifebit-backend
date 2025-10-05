const rateLimit = require('express-rate-limit');

/**
 * @description Middleware de limitación de tasa para el INICIO DE SESIÓN.
 * Combina una limitación por IP y por email para una protección de alta precisión.
 * - Por IP: Previene que una sola IP inunde el sistema con peticiones a diferentes cuentas.
 * - Por Email: Previene que un atacante se enfoque en una sola cuenta desde múltiples IPs.
 * 
 * La clave `keyGenerator` asegura que cada combinación única de (IP, email) tenga su propio
 * contador de intentos.
 */
const loginLimiter = rateLimit({
	// --- VALORES DE PRUEBA ---
	// windowMs: 1 * 60 * 1000, // Ventana de 1 minuto (para no esperar 15 mins)
	// max: 3, // Límite de 3 intentos (para probar el bloqueo rápidamente)
	
    // --- VALORES DE PRODUCCIÓN  ---
	windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
	max: 5, // Límite de 5 intentos de login por combinación (email + IP) en esa ventana

	message: {
		success: false,
		message:
			'Has excedido el límite de 5 intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos o restablece tu contraseña.',
	},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req, res) => {
		// Usa una combinación del email (del body) y la IP del solicitante.
		// Esto crea un límite mucho más granular y efectivo.
		return req.body.email + '-' + req.ip;
	},
	skipSuccessfulRequests: true, // ¡Importante! No contar los inicios de sesión exitosos.
});

/**
 * @description Middleware de limitación de tasa para la SOLICITUD DE RESETEO DE CONTRASEÑA.
 * Es deliberadamente más estricto para prevenir el spam de emails a los usuarios.
 * Solo se basa en la IP, ya que un atacante podría intentar con muchos emails diferentes.
 */
const passwordResetLimiter = rateLimit({
	// --- VALORES DE PRUEBA ---
	// windowMs: 2 * 60 * 1000, // Ventana de 2 minutos
    // max: 2, // Límite de 2 solicitudes (para probar el bloqueo rápidamente)
    
	// --- VALORES DE PRODUCCIÓN ---
	windowMs: 60 * 60 * 1000, // Ventana de 1 HORA
	max: 3, // Límite de 3 solicitudes de reseteo por IP en esa hora
	
	message: {
		success: false,
		message:
			'Has solicitado el restablecimiento de contraseña demasiadas veces. Por favor, espera una hora antes de volver a intentarlo.',
	},
	standardHeaders: true,
	legacyHeaders: false,
	// Aquí no usamos keyGenerator porque el objetivo es limitar la IP
	// para que no pueda spamear múltiples cuentas.
});

module.exports = {
    loginLimiter,
    passwordResetLimiter,
};