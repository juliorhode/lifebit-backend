/**
 * @description Inserta múltiples trabajos en la cola de una sola vez.
 * Usa pg-format para formatear los valores de forma segura.
 */
const CREA_TRABAJOS_MASIVO = `
    INSERT INTO cola_de_trabajos (tipo_trabajo, payload) VALUES %L;
`;
/**
 * @description Selecciona un lote de trabajos pendientes y los bloquea para que
 * otros workers no los tomen. 
 */
const OBTENER_Y_BLOQUEAR_TRABAJOS = `
    SELECT * FROM cola_de_trabajos
    WHERE (estado = 'pendiente' OR estado = 'fallido') AND intentos < max_intentos
    ORDER BY fecha_creacion ASC
    LIMIT 10 -- Tomamos un lote de hasta 10 trabajos a la vez.
    FOR UPDATE SKIP LOCKED;
`;
/**
 * @description Actualiza un trabajo a 'procesando'. Esto evita que, si el trabajo tarda mucho, otro ciclo del worker intente cogerlo de nuevo.
 */
const MARCAR_TRABAJOS_PROCESANDO = `
    UPDATE cola_de_trabajos SET estado = 'procesando' WHERE id = ANY($1::bigint[]);
`;
/**
 * @description Actualiza un trabajo a 'completado'.
 */
const MARCAR_TRABAJO_COMPLETADO = `
    UPDATE cola_de_trabajos
    SET estado = 'completado', fecha_procesamiento = NOW(), ultimo_error = NULL
    WHERE id = $1;
`;

/**
 * @description Actualiza un trabajo a 'fallido' y registra el error.
 */
const MARCAR_TRABAJO_FALLIDO = `
    UPDATE cola_de_trabajos
    SET estado = 'fallido', intentos = intentos + 1, ultimo_error = $1
    WHERE id = $2;
`;
module.exports = {
    CREA_TRABAJOS_MASIVO,
    OBTENER_Y_BLOQUEAR_TRABAJOS,
    MARCAR_TRABAJO_COMPLETADO,
    MARCAR_TRABAJO_FALLIDO,
    MARCAR_TRABAJOS_PROCESANDO,
};
