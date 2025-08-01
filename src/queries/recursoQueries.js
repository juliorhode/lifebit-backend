// Obtiene todos los tipos de recurso definidos para un edificio específico.
const OBTENER_TIPOS_RECURSO_POR_EDIFICIO = `
    SELECT * FROM recursos_edificio WHERE id_edificio = $1 ORDER BY id ASC;
`;

// Obtiene un tipo de recurso específico por su ID.
const OBTENER_TIPO_RECURSO_POR_ID = `
    SELECT * FROM recursos_edificio WHERE id = $1 AND id_edificio = $2;
`;

// Inserta un nuevo tipo de recurso para un edificio.
const CREA_TIPO_RECURSO = `
    INSERT INTO recursos_edificio (nombre, tipo, id_edificio) 
    VALUES ($1, $2, $3) RETURNING *;
`;

// Actualiza un tipo de recurso existente.
const ACTUALIZA_TIPO_RECURSO = `
    UPDATE recursos_edificio 
    SET nombre = $1, tipo = $2 
    WHERE id = $3 AND id_edificio = $4 RETURNING *;
`;

// Elimina un tipo de recurso.
const BORRA_TIPO_RECURSO = `
    DELETE FROM recursos_edificio WHERE id = $1 AND id_edificio = $2 RETURNING *;
`;

// Inserta múltiples instancias de recursos (inventario) en la tabla 'recursos_asignados'.
// %L será reemplazado por pg-format con los valores de las filas a insertar.
const CREA_RECURSOS_MASIVO = `
    INSERT INTO recursos_asignados (id_recurso_edificio, identificador_unico, id_unidad)
    VALUES %L;
`;

// Obtiene todos los recursos asignados de un edificio para validación.
const OBTENER_RECURSOS_ASIGNADOS_POR_EDIFICIO = `
    SELECT id, identificador_unico FROM recursos_asignados 
    WHERE id_recurso_edificio IN (SELECT id FROM recursos_edificio WHERE id_edificio = $1);
`;

// Obtiene TODOS los IDs de unidades de un edificio.
const OBTENER_IDS_UNIDADES_POR_EDIFICIO = `
    SELECT id FROM unidades WHERE id_edificio = $1;
`;

// Obtiene TODOS los IDs de recursos asignados de un edificio.
const OBTENER_IDS_RECURSOS_ASIGNADOS_POR_EDIFICIO = `
    SELECT id FROM recursos_asignados 
    WHERE id_recurso_edificio IN (SELECT id FROM recursos_edificio WHERE id_edificio = $1);
`;

// Actualiza el id_unidad de múltiples recursos a la vez usando la sintaxis de VALUES.
// Cuando pg-format construye la cláusula VALUES, crea una cadena de texto. Por ejemplo: VALUES ('50', '10'), ('51', NULL) PostgreSQL puede interpretar estos valores como de tipo text
//PostgreSQL está diciendo: "Estás intentando comparar algo que es un INTEGER con algo que es un TEXT (o VARCHAR) usando el operador =". En la cláusula WHERE ra.id = v.id_recurso.
// ra.id (de la tabla recursos_asignados) es INTEGER.
// v.id_recurso (los valores que vienen de pg-format) está siendo interpretado como TEXT.
const ACTUALIZA_ASIGNACIONES_MASIVO = `
     UPDATE recursos_asignados AS ra
    SET 
        id_unidad = v.id_unidad_nueva::int
    FROM 
        (VALUES %L) AS v(id_recurso, id_unidad_nueva)
    WHERE 
        ra.id = v.id_recurso::int; 
`;

//NOTA:
// Todas las queries incluyen AND id_edificio = $
// Esto es crucial para asegurar que un administrador del Edificio A nunca pueda ver, editar o borrar accidentalmente los tipos de recurso del Edificio B.

module.exports = {
	OBTENER_TIPOS_RECURSO_POR_EDIFICIO,
	OBTENER_TIPO_RECURSO_POR_ID,
	CREA_TIPO_RECURSO,
	ACTUALIZA_TIPO_RECURSO,
	BORRA_TIPO_RECURSO,
	CREA_RECURSOS_MASIVO,
	OBTENER_RECURSOS_ASIGNADOS_POR_EDIFICIO,
	OBTENER_IDS_UNIDADES_POR_EDIFICIO,
	OBTENER_IDS_RECURSOS_ASIGNADOS_POR_EDIFICIO,
	ACTUALIZA_ASIGNACIONES_MASIVO,
};
