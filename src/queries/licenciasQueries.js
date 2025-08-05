const OBTENER_LICENCIA_BY_ID = `SELECT id, nombre_plan, precio_base FROM licencias WHERE id = $1;`;

module.exports = { 
    OBTENER_LICENCIA_BY_ID
 };
