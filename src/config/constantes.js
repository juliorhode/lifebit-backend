/**
 * @description Define los posibles estados del Asistente de Configuración Inicial de un edificio.
 */
const ESTADOS_CONFIGURACION = {
	PASO_1_UNIDADES: 'paso_1_unidades',
	PASO_2_RECURSOS: 'paso_2_recursos',
	PASO_3_RESIDENTES: 'paso_3_residentes',
	COMPLETADO: 'completado',
};

/**
 * @description Define el orden jerárquico del flujo de configuración.
 * (Actualmente no lo usaremos para lógica de "mayor o menor que", pero si en un futuro cambiamos la logica a restrictiva, usaremos esto).
 */
const ORDEN_CONFIGURACION = [
	ESTADOS_CONFIGURACION.PASO_1_UNIDADES,
	ESTADOS_CONFIGURACION.PASO_2_RECURSOS,
	ESTADOS_CONFIGURACION.PASO_3_RESIDENTES,
	ESTADOS_CONFIGURACION.COMPLETADO,
];

module.exports = {
	ESTADOS_CONFIGURACION,
	ORDEN_CONFIGURACION,
};
