
SELECT id,nombre,direccion,moneda_funcional,fecha_creacion,fecha_actualizacion FROM edificios;

SELECT id,nombre,precio_mensual,descripcion FROM planes;

SELECT id,nombre_plan,caracteristicas FROM licencias;

SELECT * FROM unidades WHERE id_edificio = 1;

-- Borra TODAS las unidades de TODOS los edificios y resetea el contador de IDs.
TRUNCATE TABLE unidades RESTART IDENTITY CASCADE;

SELECT id,id_edificio,nombre,tipo FROM recursos_edificio;

SELECT id, numero_unidad FROM unidades WHERE id_edificio = 1;

SELECT id FROM unidades WHERE LOWER(numero_unidad) = LOWER($1) AND id_edificio = $2;

 SELECT 
        *
    FROM recursos_asignados ;


 SELECT 
        ra.id, 
        ra.identificador_unico,
        ra.id_unidad,
        u.numero_unidad AS nombre_unidad_propietaria
    FROM recursos_asignados AS ra
    LEFT JOIN unidades AS u ON ra.id_unidad = u.id
    WHERE ra.id_recurso_edificio = 4;

    select id, nombre, email, estado, rol, id_edificio_actual from usuarios where id = $1 AND id_edificio_actual = $2;

     select * from usuarios wherre id_edificio_actual = 1;

  SELECT 
        u.id, 
        u.nombre,
        u.apellido,
        u.email,
        u.estado, 
        u.rol, 
        u.id_edificio_actual,
        e.nombre AS nombre_edificio
    FROM usuarios AS u
    LEFT JOIN edificios AS e ON u.id_edificio_actual = e.id
    WHERE u.id = $1;

SELECT * from unidades;

SELECT id, numero_unidad 
FROM unidades 
WHERE id = $1 AND id_edificio = $2;

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

SELECT id, nombre, apellido, email, telefono, cedula, estado, id_unidad_actual
FROM usuarios
WHERE id = $1 AND id_edificio_actual = $2 AND rol = 'residente';

SELECT * from usuarios
JOIN unidades ON usuarios.id_unidad_actual = unidades.id
where unidades.id = $1 AND usuarios.id_edificio_actual = $2;

 SELECT id FROM usuarios 
    WHERE id_unidad_actual = $1 AND id != $2;