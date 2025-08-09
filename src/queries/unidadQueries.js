/**
 * @description Obtiene todas las unidades de un edificio específico.
 */
const OBTENER_UNIDADES_POR_EDIFICIO = `
    SELECT id, numero_unidad FROM unidades WHERE id_edificio = $1;
`;
/**
 * @description Obtiene una unidad por su nombre (case-insensitive), validando que pertenezca al edificio.
 * Usado para traducir el nombre de unidad enviado por el frontend a un ID de unidad seguro.
 */
const OBTENER_UNIDAD_POR_NOMBRE_Y_EDIFICIO = `
    SELECT id, numero_unidad FROM unidades WHERE LOWER(numero_unidad) = LOWER($1) AND id_edificio = $2;
`;
/**
 * @description Esta query es una plantilla para cargar las unidades (apartamentos) de forma masiva. Usaremos pg-format para inyectar los valores. %L se asegura de que los valores se escapen correctamente para prevenir inyección SQL. Nota Técnica: La query no usa $1, $2.... Usa un placeholder %L que es específico de la librería pg-format. La librería reemplazará este %L por una larga cadena de valores formateados como ($1, $2, $3), ($4, $5, $6), ....
 */

const INSERT_UNIDADES_MASIVO = `INSERT INTO unidades (id_edificio, numero_unidad, alicuota) VALUES %L;`;

/**
 * @description Obtiene todas las instancias de un tipo de recurso específico para un edificio, uniendo con la tabla de unidades para obtener el nombre del propietario.
 */
const OBTENER_RECURSOS_POR_TIPO = `
    SELECT 
        ra.id, 
        ra.identificador_unico,
        ra.id_unidad,
        u.numero_unidad AS nombre_unidad_propietaria
    FROM recursos_asignados AS ra
    LEFT JOIN unidades AS u ON ra.id_unidad = u.id
    WHERE ra.id_recurso_edificio = $1;
`;

/**
 * @description Obtiene una unidad por su ID, validando que pertenezca a un edificio específico.
 * Es una query de seguridad para asegurar que un admin no pueda interactuar
 * con unidades fuera de su propio condominio.
 */
const OBTENER_UNIDAD_POR_ID_Y_EDIFICIO = `
    SELECT id, numero_unidad 
    FROM unidades 
    WHERE id = $1 AND id_edificio = $2;
`;

const OBTENER_DISPONIBILIDAD_UNIDAD = `
    SELECT id FROM usuarios 
    WHERE id_unidad_actual = $1 AND id != $2;
`;
module.exports = {
	INSERT_UNIDADES_MASIVO,
	OBTENER_UNIDADES_POR_EDIFICIO,
    OBTENER_RECURSOS_POR_TIPO,
    OBTENER_UNIDAD_POR_ID_Y_EDIFICIO,
    OBTENER_UNIDAD_POR_NOMBRE_Y_EDIFICIO,
    OBTENER_DISPONIBILIDAD_UNIDAD
};
