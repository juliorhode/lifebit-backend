// src/queries/unidadQueries.js

// Esta query es una plantilla. Usaremos pg-format para inyectar los valores.
// %L se asegura de que los valores se escapen correctamente para prevenir inyección SQL.
// Nota Técnica: La query no usa $1, $2.... Usa un placeholder %L que es específico de la librería pg-format. La librería reemplazará este %L por una larga cadena de valores formateados como ($1, $2, $3), ($4, $5, $6), ....
const INSERT_UNIDADES_MASIVO = `INSERT INTO unidades (id_edificio, numero_unidad, alicuota) VALUES %L;`;

module.exports = {
	INSERT_UNIDADES_MASIVO,
};
