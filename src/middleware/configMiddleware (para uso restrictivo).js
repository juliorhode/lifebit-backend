const AppError = require('../utils/appError');
const { ORDEN_CONFIGURACION } = require('../config/constantes');

/**
 * @description Middleware que verifica si el estado de configuración de un edificio
 * ha alcanzado al menos el nivel requerido.
 * @param {string} estadoRequerido - El estado mínimo requerido de 'ESTADOS_CONFIGURACION' para pasar.
 * @returns Un middleware de Express.
 */
const verificaEstadoConfiguracion = (estadoRequerido) => {
	return (req, res, next) => {
        try {
			// Si el usuario es el dueño de la aplicación, esta regla no se aplica a él.
			// Le permitimos pasar directamente.
			if (req.user.rol === 'dueño_app') {
				return next();
			}
			// A partir de aquí, la lógica solo aplica a los administradores.
			// Obtenemos el estado actual desde el objeto req.user (poblado por protegeRuta).
			const estadoActual = req.user.estado_configuracion;
			if (!estadoActual) {
				// Este error solo ocurriría si un admin no tiene un edificio
				// o si la query de protegeRuta falló.
				throw new AppError(
					'No se pudo determinar el estado de configuracion del edificio.',
					403
				);
			}
			// Usamos nuestro array 'ORDEN_CONFIGURACION' para obtener el "nivel" de cada estado.
            const indiceActual = ORDEN_CONFIGURACION.indexOf(estadoActual);
            
            const indiceRequerido = ORDEN_CONFIGURACION.indexOf(estadoRequerido);
            
            if (indiceRequerido === -1) {
                throw new AppError(`Erro de configuracion: El estado "${estadoRequerido}" no es valido.`)
            }
			// Si el nivel actual es menor que el nivel requerido, el admin no ha llegado a este paso.
			if (indiceActual < indiceRequerido) {
				throw new AppError(
					`Accion no permitida. Debes completar el paso de "${estadoRequerido}" primero antes de continuar. El estado actual de tu edificio es: "${estadoActual}"`,
					403
				);
			}
			next();
		} catch (error) {
			next(error);
		}
	};
};

// Exportamos el middleware.
module.exports = { verificaEstadoConfiguracion };
