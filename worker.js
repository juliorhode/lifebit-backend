// --- CONFIGURACIÓN E IMPORTACIONES ---
require('dotenv').config();
const db = require('./src/config/db');
const emailService = require('./src/services/emailService');
const queries = require('./src/queries/trabajoQueries');

// const INTERVALO_DE_SONDEO = 600000; // 10 minutos en milisegundos.
const INTERVALO_DE_SONDEO = 60000; // 1 minuto en milisegundos.

/**
 * @description Procesa un único trabajo de la cola.
 * @param {object} trabajo - El objeto de trabajo obtenido de la base de datos.
 */
const procesarTrabajo = async (trabajo) => {
	// Usamos un switch para poder añadir más tipos de trabajo en el futuro.
	switch (trabajo.tipo_trabajo) {
		case 'enviar_email_invitacion_residente':
			// Extraemos los datos del payload del trabajo.
			const { destinatarioEmail, destinatarioNombre, token, nombreEdificio } =
				trabajo.payload;
			// Llamamos a nuestro servicio de email para ejecutar la tarea.
			await emailService.enviarEmailInvitacionResidente(
				destinatarioEmail,
				destinatarioNombre,
				token,
				nombreEdificio
			);
			break;
		case 'enviar_email_reseteo_pass':
			// Extraemos los datos del payload del trabajo.
			const {
				destinatarioEmail: emailReset,
				destinatarioNombre: nombreREset,
				token: tokenREset,
			} = trabajo.payload;
			await emailService.enviarEmailReseteoPassword(emailReset, nombreREset, tokenREset);
			break;
		case 'enviar_alerta_cambio_email':
			const {
				destinatarioEmail: emailAlerta,
				destinatarioNombre: nombreAlerta,
				nuevoEmail,
			} = trabajo.payload;
			await emailService.enviarAlertaCambioEmail(emailAlerta, nombreAlerta, nuevoEmail);
			break;
		case 'enviar_verificacion_nuevo_email':
			const {
				destinatarioEmail: emailVerif,
				destinatarioNombre: nombreVerif,
				token: tokenVerif,
			} = trabajo.payload;
			await emailService.enviarVerificacionNuevoEmail(emailVerif, nombreVerif, tokenVerif);
			break;

		default:
			throw new Error(`Tipo de trabajo desconocido: ${trabajo.tipo_trabajo}`);
	}
};

/**
 * @description El bucle principal del worker. Se despierta, busca trabajos y los procesa.
 */
const cicloDelWorker = async () => {
	console.log(`Worker despertando... Buscando trabajos pendientes.`);
	const cliente = await db.getClient();
	try {
		await cliente.query('BEGIN');

		const { rows: trabajos } = await cliente.query(queries.OBTENER_Y_BLOQUEAR_TRABAJOS);
		if (trabajos.length === 0) {
			console.log('No hay trabajos pendientes. Volviendo a dormir.');
			await cliente.query('COMMIT'); // Hacemos commit para liberar cualquier bloqueo implícito.
			return;
		}
		// --- MARCAR COMO 'PROCESANDO' ---
		const idsDeTrabajos = trabajos.map((t) => t.id);
		await cliente.query(queries.MARCAR_TRABAJOS_PROCESANDO, [idsDeTrabajos]);
		console.log(`Se encontraron y marcaron ${trabajos.length} trabajos para procesar.`);

		for (const trabajo of trabajos) {
			try {
				console.log(`Procesando trabajo #${trabajo.id} (${trabajo.tipo_trabajo})...`);
				await procesarTrabajo(trabajo);
				// Si procesarTrabajo tiene éxito, marcamos el trabajo como completado.
				await cliente.query(queries.MARCAR_TRABAJO_COMPLETADO, [trabajo.id]);
				console.log(`✅ Trabajo #${trabajo.id} completado.`);
			} catch (error) {
				// Si procesarTrabajo falla, marcamos el trabajo como fallido.
				console.error(`❌ Falló el trabajo #${trabajo.id}. Error: ${error.message}`);
				await cliente.query(queries.MARCAR_TRABAJO_FALLIDO, [error.message, trabajo.id]);
			}
		}

		await cliente.query('COMMIT');
	} catch (error) {
		await cliente.query('ROLLBACK');
		console.error('❌ Error mayor en el ciclo del worker:', error);
	} finally {
		cliente.release();
	}
};

// --- INICIO DEL WORKER ---
console.log('🚀 Worker de LifeBit iniciado.');
console.log(`Sondeando la base de datos cada ${INTERVALO_DE_SONDEO / 1000} segundos.`);

// Ejecutamos el ciclo una vez al inicio.
cicloDelWorker();
// Y luego lo configuramos para que se repita cada X segundos.
setInterval(cicloDelWorker, INTERVALO_DE_SONDEO);
