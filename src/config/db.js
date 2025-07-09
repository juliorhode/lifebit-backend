// 1. Importamos la clase 'Pool' desde la librería 'pg'.
// Pool es ideal para entornos de servidor, ya que gestiona un conjunto
// de conexiones de cliente reutilizables.
const { Pool } = require('pg');

// 2. Creamos una nueva instancia del Pool.
// La configuración se pasa como un objeto.
const pool = new Pool({
    // 3. Leemos las credenciales directamente de nuestras variables de entorno (process.env)
    // que cargamos en server.js gracias a dotenv.
    // Esto hace que nuestra configuración de BD sea segura y portable.
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,

    // --- Parámetros Opcionales pero Recomendados del Pool ---

    // Número máximo de clientes (conexiones) en el pool.
    // El valor por defecto es 10. 20 es un buen punto de partida para una API.
    max: 20,

    // Cuánto tiempo (en milisegundos) un cliente puede estar inactivo en el pool
    // antes de ser cerrado y eliminado.
    idleTimeoutMillis: 30000, // 30 segundos

    // Cuánto tiempo (en milisegundos) se esperará por una conexión
    // del pool antes de lanzar un error.
    connectionTimeoutMillis: 2000, // 2 segundos
});

// 4. (Opcional pero muy útil) Añadimos un listener para el evento 'connect'.
// Esto nos permite saber cuando un nuevo cliente se conecta al pool.
// Es excelente para depuración.
pool.on('connect', () => {
    console.log('🔗 Cliente conectado a la base de datos!');
});

// 5. (Opcional pero muy útil) Añadimos un listener para el evento 'error'.
// Esto atrapará errores del pool que no están asociados a una query específica,
// como problemas de red.
pool.on('error', (err, client) => {
    console.error('❌ Error inesperado en el cliente del pool de DB', err);
    process.exit(-1); // Salir del proceso si el pool falla es una medida de seguridad.
});


// 6. Exportamos un objeto que contiene un método 'query'.
// Esto es un patrón de diseño llamado "Fachada" (Facade).
// En lugar de que cada parte de nuestra app importe y use 'pool' directamente,
// todos usarán este objeto 'db'. Si en el futuro queremos añadir logging
// o métricas a CADA consulta, solo lo cambiamos en este lugar.
module.exports = {
    query: (text, params) => pool.query(text, params),
};