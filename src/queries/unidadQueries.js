// Obtiene todas las unidades de un edificio específico.
const OBTENER_UNIDADES_POR_EDIFICIO = `
    SELECT id, numero_unidad FROM unidades WHERE id_edificio = $1;
`;

// Esta query es una plantilla. Usaremos pg-format para inyectar los valores.
// %L se asegura de que los valores se escapen correctamente para prevenir inyección SQL.
// Nota Técnica: La query no usa $1, $2.... Usa un placeholder %L que es específico de la librería pg-format. La librería reemplazará este %L por una larga cadena de valores formateados como ($1, $2, $3), ($4, $5, $6), ....
const INSERT_UNIDADES_MASIVO = `INSERT INTO unidades (id_edificio, numero_unidad, alicuota) VALUES %L;`;

// Obtiene todas las instancias de un tipo de recurso específico para un edificio,
// uniendo con la tabla de unidades para obtener el nombre del propietario.
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

module.exports = {
	INSERT_UNIDADES_MASIVO,
	OBTENER_UNIDADES_POR_EDIFICIO,
	OBTENER_RECURSOS_POR_TIPO,
};
