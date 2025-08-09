/**
 * @description Obtiene una lista de todos los residentes de un edificio específico.
 * Se une con la tabla de unidades para mostrar el nombre del apartamento de cada residente.
 */
const OBTENER_RESIDENTES_POR_EDIFICIO = `
    SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        u.cedula,
        u.estado,
        un.numero_unidad
    FROM usuarios AS u
    LEFT JOIN unidades AS un ON u.id_unidad_actual = un.id
    WHERE u.id_edificio_actual = $1 AND u.rol = 'residente'
    ORDER BY un.numero_unidad ASC, u.nombre ASC;
`;
/**
 * @description Actualiza los datos de un residente.
 * NOTA: No se permite cambiar el rol.
 */
const ACTUALIZAR_RESIDENTE = `
    UPDATE usuarios
    SET
        nombre = $1,
        apellido = $2,
        email = $3,
        telefono = $4,
        cedula = $5,
        estado = $6,
        id_unidad_actual = $7,
        fecha_actualizacion = NOW()
    WHERE id = $8
    RETURNING id, nombre, apellido, email, telefono, cedula, estado, id_unidad_actual;
`;
/**
 * @description Obtiene un residente específico por su ID, validando que pertenezca al edificio del admin. Usado para las operaciones de Update y Delete.
 */
const OBTENER_RESIDENTE_POR_ID_Y_EDIFICIO = `
    SELECT id, nombre, apellido, email, telefono, cedula, estado, id_unidad_actual
    FROM usuarios
    WHERE id = $1 AND id_edificio_actual = $2 AND rol = 'residente';
`;

/**
 * @description Realiza un "borrado blando" de un residente cambiando su estado a 'suspendido'.
 */
const SUSPENDER_RESIDENTE = `
    UPDATE usuarios
    SET estado = 'suspendido', fecha_actualizacion = NOW()
    WHERE id = $1
    RETURNING id, nombre, apellido, estado;
`;
module.exports = {
    OBTENER_RESIDENTES_POR_EDIFICIO,
    ACTUALIZAR_RESIDENTE,
    OBTENER_RESIDENTE_POR_ID_Y_EDIFICIO,
    SUSPENDER_RESIDENTE
};