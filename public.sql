
SELECT id,nombre,direccion,moneda_funcional,fecha_creacion,fecha_actualizacion FROM edificios;

SELECT id,nombre,precio_mensual,descripcion FROM planes;

SELECT id,nombre_plan,caracteristicas FROM licencias;

SELECT * FROM unidades WHERE id_edificio = 1;

-- Borra TODAS las unidades de TODOS los edificios y resetea el contador de IDs.
TRUNCATE TABLE unidades RESTART IDENTITY CASCADE;

SELECT id,id_edificio,nombre,tipo FROM recursos_edificio;

SELECT id, numero_unidad FROM unidades WHERE id_edificio = 1

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

    select id, nombre, email, estado, rol, id_edificio_actual from usuarios where id = 2;

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