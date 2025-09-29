/**
 * @description Inserta una nueva licencia (plan de servicio).
 */
const INSERT_LICENCIA = `
    INSERT INTO licencias (nombre_plan, precio_base, caracteristicas)
    VALUES ($1, $2, $3) RETURNING *;
`;

/**
 * @description Obtiene todas las licencias ordenadas por ID.
 */
const OBTENER_TODAS_LICENCIAS = `SELECT * FROM licencias ORDER BY id ASC;`;

/**
 * @description Obtiene una licencia específica por su ID.
 */
const OBTENER_LICENCIA_BY_ID = `SELECT * FROM licencias WHERE id = $1;`;

/**
 * @description Actualiza una licencia existente por su ID.
 * Utiliza COALESCE para mantener el valor actual si no se proporciona uno nuevo.
 * (COALESCE) es una función de PostgreSQL que devuelve el primer valor que no sea NULL.
 * Si desde el controlador enviamos NULL para nombre_plan (porque no se quiere actualizar),
 * COALESCE elegirá el valor que ya estaba en la base de datos (nombre_plan), evitando que
 * se borre accidentalmente.
 */
const UPDATE_LICENCIA = `
    UPDATE licencias
    SET 
        nombre_plan = COALESCE($1, nombre_plan),
        precio_base = COALESCE($2, precio_base),
        caracteristicas = COALESCE($3, caracteristicas)
    WHERE id = $4
    RETURNING *;
`;

/**
 * @description Elimina una licencia por su ID.
 */
const DELETE_LICENCIA = `DELETE FROM licencias WHERE id = $1 RETURNING *;`;

module.exports = {
	OBTENER_LICENCIA_BY_ID,
	INSERT_LICENCIA,
	OBTENER_TODAS_LICENCIAS,
	UPDATE_LICENCIA,
	DELETE_LICENCIA,
};
