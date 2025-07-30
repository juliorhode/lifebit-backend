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
};
