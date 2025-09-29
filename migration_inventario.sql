-- =====================================================
-- MIGRACIÓN: Soporte para recursos de inventario
-- =====================================================

-- 1. Agregar columna estado_operativo
ALTER TABLE recursos_asignados
ADD COLUMN estado_operativo VARCHAR(20) DEFAULT 'operativo';

-- 2. Agregar check constraint para estado_operativo
ALTER TABLE recursos_asignados
ADD CONSTRAINT check_estado_operativo
CHECK (estado_operativo IN ('operativo', 'no_operativo', 'mantenimiento'));

-- 3. Hacer id_unidad nullable
ALTER TABLE recursos_asignados
ALTER COLUMN id_unidad DROP NOT NULL;

-- 4. Actualizar datos existentes: setear id_unidad = null para inventario
UPDATE recursos_asignados
SET id_unidad = NULL
WHERE id_recurso_edificio IN (
    SELECT id FROM recursos_edificio WHERE tipo = 'inventario'
);

-- 5. Recrear índice único (permitiendo nulls en id_unidad)
DROP INDEX IF EXISTS uq_recursos_asignados_identificador;
CREATE UNIQUE INDEX uq_recursos_asignados_identificador
ON recursos_asignados (id_recurso_edificio, identificador_unico);

-- 6. Agregar constraint de integridad
ALTER TABLE recursos_asignados
ADD CONSTRAINT check_tipo_asignacion
CHECK (
    CASE WHEN (SELECT tipo FROM recursos_edificio WHERE id = id_recurso_edificio) = 'inventario'
    THEN id_unidad IS NULL AND estado_operativo IS NOT NULL
    ELSE id_unidad IS NOT NULL
    END
);