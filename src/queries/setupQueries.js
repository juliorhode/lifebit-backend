// Verifica si un usuario con un email específico ya existe.
const CHECK_USER_EXISTS = `SELECT 1 FROM usuarios WHERE email = $1;`
// SELECT 1: Es una micro-optimización; se considera ligeramente más rápido en PostgreSQL para solo verificar existencia.

// Inserta el registro del dueño_app.
const INSERT_OWNER = `
    INSERT INTO usuarios (nombre, apellido, email, contraseña, telefono, cedula, estado, rol)
    VALUES ($1, $2, $3, $4, $5, $6, 'activo', 'dueño_app');
`
// --- QUERIES DE LICENCIAS ---
// Verifica si ya existe alguna licencia en la tabla.
const CHECK_LICENCIAS_EXIST = `SELECT 1 FROM licencias LIMIT 1;`;

// Inserta los tres planes de servicio básicos en una sola consulta.
const INSERT_LICENCIAS_BASE = `
    INSERT INTO licencias (nombre_plan, precio_base, caracteristicas) VALUES 
    ('Básico', 20.00, '{"modulos": ["finanzas", "noticias"], "max_usuarios": 50}'),
    ('Gold', 50.00, '{"modulos": ["finanzas", "noticias", "foro"], "max_usuarios": 150}'),
    ('Premium', 90.00, '{"modulos": ["todos"], "max_usuarios": 500, "soporte_dedicado": true}');
`;

module.exports = {
	CHECK_USER_EXISTS,
	INSERT_OWNER,
    CHECK_LICENCIAS_EXIST,
    INSERT_LICENCIAS_BASE
}
