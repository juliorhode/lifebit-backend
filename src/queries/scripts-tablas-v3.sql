-- Sentencia para eliminar las tablas si ya existen, en el orden correcto de dependencias.
DROP TABLE IF EXISTS afiliaciones CASCADE;
DROP TABLE IF EXISTS unidades CASCADE;
DROP TABLE IF EXISTS edificios CASCADE;
DROP TABLE IF EXISTS contratos CASCADE;
DROP TABLE IF EXISTS licencias CASCADE;
DROP TABLE IF EXISTS solicitudes_servicio CASCADE;
DROP TABLE IF EXISTS archivos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS reglas CASCADE;
DROP TABLE IF EXISTS auditoria CASCADE;

-- -----------------------------------------------------------------------------
-- Tabla: usuarios
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255),
    telefono VARCHAR(50),
    cedula VARCHAR(20) UNIQUE,
    avatar_url VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    estado VARCHAR(50) NOT NULL DEFAULT 'invitado' CHECK (estado IN ('invitado', 'activo', 'suspendido')),
    token_registro VARCHAR(255),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE usuarios IS 'Almacena la información personal de cada PERSONA física en el sistema. Es la fuente única de verdad para la identidad.';

-- -----------------------------------------------------------------------------
-- Tabla: licencias
-- -----------------------------------------------------------------------------
CREATE TABLE licencias (
  id SERIAL PRIMARY KEY,
  nombre_plan VARCHAR(50) NOT NULL UNIQUE,
  caracteristicas JSONB
);
COMMENT ON TABLE licencias IS 'Catálogo de los PLANES DE SERVICIO (Básico, Premium) que ofrece LifeBit.';

-- -----------------------------------------------------------------------------
-- Tabla: contratos
-- -----------------------------------------------------------------------------
CREATE TABLE contratos (
  id SERIAL PRIMARY KEY,
  id_licencia INTEGER NOT NULL REFERENCES licencias(id),
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'activo' CHECK (estado IN ('solicitud', 'activo', 'moroso', 'vencido', 'cancelado')),
  monto_mensual NUMERIC(12, 2) NOT NULL
);
COMMENT ON TABLE contratos IS 'Registra el CONTRATO de servicio activo entre LifeBit y un Edificio, definiendo su duración y costo.';

-- -----------------------------------------------------------------------------
-- Tabla: edificios
-- -----------------------------------------------------------------------------
CREATE TABLE edificios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  id_contrato INTEGER NOT NULL UNIQUE REFERENCES contratos(id),
  moneda_funcional VARCHAR(3) NOT NULL DEFAULT 'USD',
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE edificios IS 'Representa cada CONDOMINIO o propiedad gestionada. Es el cliente principal del SaaS.';

-- -----------------------------------------------------------------------------
-- Tabla: unidades
-- -----------------------------------------------------------------------------
CREATE TABLE unidades (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  numero_unidad VARCHAR(50) NOT NULL,
  alicuota NUMERIC(8, 4) NOT NULL DEFAULT 0,
  metros_cuadrados NUMERIC(10, 2),
  tipo VARCHAR(50),
  UNIQUE (id_edificio, numero_unidad)
);
COMMENT ON TABLE unidades IS 'Representa una unidad individual (apartamento, local) dentro de un edificio.';

-- -----------------------------------------------------------------------------
-- Tabla: afiliaciones
-- -----------------------------------------------------------------------------
CREATE TABLE afiliaciones (
  id SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  id_unidad INTEGER REFERENCES unidades(id) ON DELETE SET NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('dueño_app', 'administrador', 'gestor', 'residente')),
  es_propietario BOOLEAN NOT NULL DEFAULT false,
  es_arrendatario BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (id_usuario, id_edificio, id_unidad, rol)
);
COMMENT ON TABLE afiliaciones IS 'Tabla de unión que define QUÉ ROL juega un USUARIO y DÓNDE. Es el corazón de los permisos.';

-- -----------------------------------------------------------------------------
-- Tabla: archivos (Polimórfica)
-- -----------------------------------------------------------------------------
CREATE TABLE archivos (
  id SERIAL PRIMARY KEY,
  nombre_original VARCHAR(255) NOT NULL,
  url_recurso VARCHAR(255) NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL,
  tamaño_bytes INTEGER NOT NULL,
  id_usuario_subio INTEGER NOT NULL REFERENCES usuarios(id),
  fecha_subida TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE archivos IS 'Repositorio central polimórfico para los metadatos de TODOS los archivos subidos al sistema.';

-- -----------------------------------------------------------------------------
-- Tabla: solicitudes_servicio
-- -----------------------------------------------------------------------------
CREATE TABLE solicitudes_servicio (
  id SERIAL PRIMARY KEY,
  nombre_solicitante VARCHAR(255) NOT NULL,
  email_solicitante VARCHAR(255) NOT NULL,
  telefono_solicitante VARCHAR(50),
  cedula_solicitante VARCHAR(20),
  id_archivo_cedula INTEGER REFERENCES archivos(id),
  nombre_edificio VARCHAR(255) NOT NULL,
  direccion_edificio TEXT,
  id_documento_condominio INTEGER REFERENCES archivos(id),
  id_licencia_solicitada INTEGER NOT NULL REFERENCES licencias(id),
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE solicitudes_servicio IS 'Almacena las SOLICITUDES de nuevos clientes que llegan desde la Landing Page.';

-- -----------------------------------------------------------------------------
-- Tabla: reglas
-- -----------------------------------------------------------------------------
CREATE TABLE reglas (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  evento_disparador VARCHAR(100) NOT NULL,
  definicion JSONB NOT NULL,
  esta_activa BOOLEAN NOT NULL DEFAULT true
);
COMMENT ON TABLE reglas IS 'Almacena las REGLAS DE NEGOCIO personalizadas (en formato JSONB) para cada edificio.';

-- -----------------------------------------------------------------------------
-- Tabla: auditoria
-- -----------------------------------------------------------------------------
CREATE TABLE auditoria (
  id BIGSERIAL PRIMARY KEY,
  id_usuario_actor INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(50) NOT NULL,
  nombre_tabla VARCHAR(100),
  id_registro_afectado TEXT,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  timestamp TIMESTAMptz NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE auditoria IS 'Registro inmutable de acciones de escritura en la BD para auditoría y posibles reversos.';


-- =================================================================================
-- || LOTE 2/3: NÚCLEO CONTABLE Y FINANZAS OPERATIVAS                             ||
-- =================================================================================
-- || Este lote establece el sistema de partida doble y las tablas              ||
-- || operativas para la facturación y gestión de pagos.                        ||
-- =================================================================================

-- Sentencia para eliminar las tablas si ya existen, en el orden correcto de dependencias.
DROP TABLE IF EXISTS aplicacion_pagos CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS detalles_recibo CASCADE;
DROP TABLE IF EXISTS recibos_unidad CASCADE;
DROP TABLE IF EXISTS recibos_maestro CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS multas CASCADE;
DROP TABLE IF EXISTS tasas_cambio CASCADE;
DROP TABLE IF EXISTS cuentas_bancarias CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS areas_comunes CASCADE;
DROP TABLE IF EXISTS recursos_asignados CASCADE;
DROP TABLE IF EXISTS recursos_edificio CASCADE;
DROP TABLE IF EXISTS movimientos_contables CASCADE;
DROP TABLE IF EXISTS asientos_contables CASCADE;
DROP TABLE IF EXISTS plan_de_cuentas CASCADE;


-- -----------------------------------------------------------------------------
-- Tabla 11: plan_de_cuentas
-- El catálogo de cuentas contables para cada edificio.
-- -----------------------------------------------------------------------------
CREATE TABLE plan_de_cuentas (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  codigo_cuenta VARCHAR(20) NOT NULL,
  nombre_cuenta VARCHAR(100) NOT NULL,
  tipo_cuenta VARCHAR(50) NOT NULL CHECK (tipo_cuenta IN ('Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Egreso')),
  permite_movimientos BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (id_edificio, codigo_cuenta)
);
COMMENT ON TABLE plan_de_cuentas IS 'El catálogo de cuentas contables para cada edificio.';

-- -----------------------------------------------------------------------------
-- Tabla 12: asientos_contables
-- El Libro Diario. Cada fila es una transacción contable completa.
-- -----------------------------------------------------------------------------
CREATE TABLE asientos_contables (
  id BIGSERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  referencia_origen VARCHAR(100)
);
COMMENT ON TABLE asientos_contables IS 'El Libro Diario. Cada fila es una transacción contable completa.';
COMMENT ON COLUMN asientos_contables.referencia_origen IS 'ej. "pago_id_123", "gasto_id_456"';

-- -----------------------------------------------------------------------------
-- Tabla 13: movimientos_contables
-- El Libro Mayor. Cada fila es un débito o un crédito de un asiento.
-- -----------------------------------------------------------------------------
CREATE TABLE movimientos_contables (
  id BIGSERIAL PRIMARY KEY,
  id_asiento INTEGER NOT NULL REFERENCES asientos_contables(id) ON DELETE CASCADE,
  id_cuenta INTEGER NOT NULL REFERENCES plan_de_cuentas(id) ON DELETE RESTRICT,
  debe NUMERIC(15, 2) NOT NULL DEFAULT 0,
  haber NUMERIC(15, 2) NOT NULL DEFAULT 0,
  CHECK (debe >= 0 AND haber >= 0 AND (debe > 0 OR haber > 0))
);
COMMENT ON TABLE movimientos_contables IS 'El Libro Mayor. Cada fila es un débito o un crédito de un asiento, debe estar siempre balanceado.';

-- -----------------------------------------------------------------------------
-- Tabla 14: gastos
-- -----------------------------------------------------------------------------
CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  monto NUMERIC(12, 2) NOT NULL,
  fecha_gasto DATE NOT NULL,
  categoria VARCHAR(100),
  id_factura_adjunta INTEGER REFERENCES archivos(id) ON DELETE SET NULL,
  id_asiento_contable INTEGER REFERENCES asientos_contables(id) ON DELETE SET NULL
);
COMMENT ON TABLE gastos IS 'Registro de cada GASTO individual incurrido por un condominio.';

-- -----------------------------------------------------------------------------
-- Tabla 15: recibos_maestro
-- -----------------------------------------------------------------------------
CREATE TABLE recibos_maestro (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL,
  año INTEGER NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  total_gastos_comunes NUMERIC(15, 2) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'generado' CHECK (estado IN ('generado', 'distribuido', 'cerrado')),
  UNIQUE (id_edificio, mes, año)
);
COMMENT ON TABLE recibos_maestro IS 'Representa el "corte de cuentas" o ciclo de facturación de un mes para un edificio.';

-- -----------------------------------------------------------------------------
-- Tabla 16: recibos_unidad
-- -----------------------------------------------------------------------------
CREATE TABLE recibos_unidad (
  id SERIAL PRIMARY KEY,
  id_recibo_maestro INTEGER NOT NULL REFERENCES recibos_maestro(id) ON DELETE CASCADE,
  id_unidad INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  monto_total_a_pagar NUMERIC(12, 2) NOT NULL,
  estado_pago VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado_parcial', 'pagado', 'en_mora')),
  saldo_restante NUMERIC(12, 2) NOT NULL
);
COMMENT ON TABLE recibos_unidad IS 'La "FACTURA" o deuda específica de una unidad para un ciclo de facturación.';

-- -----------------------------------------------------------------------------
-- Tabla 17: multas
-- -----------------------------------------------------------------------------
CREATE TABLE multas (
    id SERIAL PRIMARY KEY,
    id_unidad INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL,
    motivo TEXT NOT NULL,
    fecha_aplicacion DATE NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'facturada', 'pagada'))
);
COMMENT ON TABLE multas IS 'Registro de penalizaciones monetarias aplicadas a una unidad por infracciones.';

-- -----------------------------------------------------------------------------
-- Tabla 18: tasas_cambio
-- -----------------------------------------------------------------------------
CREATE TABLE tasas_cambio (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL UNIQUE,
  tasa NUMERIC(18, 6) NOT NULL,
  fuente VARCHAR(50)
);
COMMENT ON TABLE tasas_cambio IS 'Registro histórico de las TASAS DE CAMBIO diarias para conversiones de moneda.';

-- -----------------------------------------------------------------------------
-- Tabla 19: pagos
-- -----------------------------------------------------------------------------
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  id_usuario_pagador INTEGER NOT NULL REFERENCES usuarios(id),
  id_edificio INTEGER NOT NULL REFERENCES edificios(id),
  monto NUMERIC(12, 2) NOT NULL,
  moneda VARCHAR(3) NOT NULL,
  fecha_pago DATE NOT NULL,
  metodo_pago VARCHAR(50),
  referencia VARCHAR(100),
  id_comprobante_adjunto INTEGER REFERENCES archivos(id),
  tipo_pago VARCHAR(50) NOT NULL CHECK (tipo_pago IN ('condominio', 'reserva', 'licencia_saas')),
  estado VARCHAR(50) NOT NULL DEFAULT 'en_verificacion' CHECK (estado IN ('en_verificacion', 'validado', 'rechazado')),
  id_tasa_cambio INTEGER REFERENCES tasas_cambio(id),
  id_asiento_contable INTEGER REFERENCES asientos_contables(id)
);
COMMENT ON TABLE pagos IS 'Registro de cada TRANSACCIÓN de pago realizada en la plataforma.';

-- -----------------------------------------------------------------------------
-- Tabla 20: aplicacion_pagos
-- -----------------------------------------------------------------------------
CREATE TABLE aplicacion_pagos (
  id_pago INTEGER NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
  id_recibo_unidad INTEGER NOT NULL REFERENCES recibos_unidad(id) ON DELETE CASCADE,
  monto_aplicado NUMERIC(12, 2) NOT NULL,
  PRIMARY KEY (id_pago, id_recibo_unidad)
);
COMMENT ON TABLE aplicacion_pagos IS 'Tabla de unión que resuelve la relación muchos-a-muchos entre Pagos y Deudas.';

-- -----------------------------------------------------------------------------
-- Tabla 21: cuentas_bancarias
-- -----------------------------------------------------------------------------
CREATE TABLE cuentas_bancarias (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  banco VARCHAR(100) NOT NULL,
  numero_cuenta VARCHAR(50) NOT NULL,
  titular VARCHAR(255) NOT NULL,
  cedula_rif VARCHAR(20) NOT NULL,
  tipo_pago VARCHAR(50) NOT NULL,
  telefono VARCHAR(50),
  esta_activa BOOLEAN NOT NULL DEFAULT true
);
COMMENT ON TABLE cuentas_bancarias IS 'Almacena las CUENTAS BANCARIAS del condominio donde los residentes deben pagar.';

-- -----------------------------------------------------------------------------
-- Tabla 22: areas_comunes
-- -----------------------------------------------------------------------------
CREATE TABLE areas_comunes (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  tarifa_reserva NUMERIC(10, 2),
  reglas_uso TEXT
);
COMMENT ON TABLE areas_comunes IS 'Catálogo de las ÁREAS COMUNES rentables del edificio (ej. Salón de Fiestas).';

-- -----------------------------------------------------------------------------
-- Tabla 23: reservas
-- -----------------------------------------------------------------------------
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  id_area_comun INTEGER NOT NULL REFERENCES areas_comunes(id) ON DELETE CASCADE,
  id_afiliacion_solicitante INTEGER NOT NULL REFERENCES afiliaciones(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'cancelada', 'completada')),
  id_pago_asociado INTEGER REFERENCES pagos(id) ON DELETE SET NULL
);
COMMENT ON TABLE reservas IS 'Registro de las solicitudes de reserva de áreas comunes por parte de los residentes.';

-- -----------------------------------------------------------------------------
-- Tabla 24: detalles_recibo
-- -----------------------------------------------------------------------------
CREATE TABLE detalles_recibo (
  id BIGSERIAL PRIMARY KEY,
  id_recibo_unidad INTEGER NOT NULL REFERENCES recibos_unidad(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  monto NUMERIC(12, 2) NOT NULL,
  id_gasto_origen INTEGER REFERENCES gastos(id) ON DELETE SET NULL,
  id_multa_origen INTEGER REFERENCES multas(id) ON DELETE SET NULL,
  id_reserva_origen INTEGER REFERENCES reservas(id) ON DELETE SET NULL
);
COMMENT ON TABLE detalles_recibo IS 'Cada línea de cobro que compone el total de un recibo de unidad.';

-- -----------------------------------------------------------------------------
-- Tabla 25: recursos_edificio y recursos_asignados
-- -----------------------------------------------------------------------------
CREATE TABLE recursos_edificio (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('asignable', 'inventario'))
);
COMMENT ON TABLE recursos_edificio IS 'Catálogo de los TIPOS de recursos que existen en un edificio (ej. "Puesto de Estacionamiento").';

CREATE TABLE recursos_asignados (
  id SERIAL PRIMARY KEY,
  id_recurso_edificio INTEGER NOT NULL REFERENCES recursos_edificio(id) ON DELETE CASCADE,
  id_unidad INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  identificador_unico VARCHAR(100)
);
COMMENT ON TABLE recursos_asignados IS 'Registro de la ASIGNACIÓN de un recurso específico a una unidad concreta.';


-- =================================================================================
-- || LOTE 3/3: COMUNICACIÓN, PARTICIPACIÓN Y SOPORTE                           ||
-- =================================================================================
-- || Este lote establece las tablas para la interacción social y los           ||
-- || sistemas de soporte y gestión de documentos.                              ||
-- =================================================================================

-- Sentencia para eliminar las tablas si ya existen, en el orden correcto de dependencias.
DROP TABLE IF EXISTS respuestas_consulta CASCADE;
DROP TABLE IF EXISTS opciones_consulta CASCADE;
DROP TABLE IF EXISTS consultas_populares CASCADE;
DROP TABLE IF EXISTS discusiones_respuestas CASCADE;
DROP TABLE IF EXISTS discusiones_hilos CASCADE;
DROP TABLE IF EXISTS noticias CASCADE;
DROP TABLE IF EXISTS incidencias CASCADE;
DROP TABLE IF EXISTS cartas CASCADE;


-- -----------------------------------------------------------------------------
-- Tabla 26: noticias
-- Almacena el contenido de las NOTICIAS, ya sean globales o específicas de un condominio.
-- -----------------------------------------------------------------------------
CREATE TABLE noticias (
  id SERIAL PRIMARY KEY,
  id_usuario_autor INTEGER NOT NULL REFERENCES usuarios(id),
  id_edificio_destino INTEGER REFERENCES edificios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  contenido_html TEXT NOT NULL,
  fecha_publicacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE noticias IS 'Almacena noticias, globales (id_edificio NULL) o específicas de un condominio.';

-- -----------------------------------------------------------------------------
-- Tabla 27: discusiones_hilos
-- Cada registro es un HILO de conversación principal en el foro de un edificio.
-- -----------------------------------------------------------------------------
CREATE TABLE discusiones_hilos (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  id_afiliacion_creador INTEGER NOT NULL REFERENCES afiliaciones(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  contenido TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE discusiones_hilos IS 'Cada registro es un HILO de conversación principal en el foro de un edificio.';

-- -----------------------------------------------------------------------------
-- Tabla 28: discusiones_respuestas
-- Cada registro es un COMENTARIO o respuesta dentro de un hilo de discusión.
-- -----------------------------------------------------------------------------
CREATE TABLE discusiones_respuestas (
  id SERIAL PRIMARY KEY,
  id_hilo INTEGER NOT NULL REFERENCES discusiones_hilos(id) ON DELETE CASCADE,
  id_afiliacion_autor INTEGER NOT NULL REFERENCES afiliaciones(id) ON DELETE CASCADE,
  id_respuesta_padre INTEGER REFERENCES discusiones_respuestas(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE discusiones_respuestas IS 'Cada registro es un COMENTARIO o respuesta dentro de un hilo de discusión.';

-- -----------------------------------------------------------------------------
-- Tabla 29: consultas_populares
-- Tabla unificada para gestionar ENCUESTAS, VOTACIONES y ELECCIONES.
-- -----------------------------------------------------------------------------
CREATE TABLE consultas_populares (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER REFERENCES edificios(id) ON DELETE CASCADE,
  id_usuario_creador INTEGER NOT NULL REFERENCES usuarios(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('encuesta_abierta', 'encuesta_cerrada', 'eleccion')),
  fecha_fin TIMESTAMPTZ NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada', 'cancelada'))
);
COMMENT ON TABLE consultas_populares IS 'Tabla unificada para gestionar Encuestas, Votaciones y Elecciones.';

-- -----------------------------------------------------------------------------
-- Tabla 30: opciones_consulta
-- Almacena las OPCIONES para una consulta (ej. "Sí/No", o los candidatos).
-- -----------------------------------------------------------------------------
CREATE TABLE opciones_consulta (
  id SERIAL PRIMARY KEY,
  id_consulta INTEGER NOT NULL REFERENCES consultas_populares(id) ON DELETE CASCADE,
  texto_opcion TEXT,
  id_usuario_candidato INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);
COMMENT ON TABLE opciones_consulta IS 'Almacena las OPCIONES para una consulta (ej. "Sí/No", o los candidatos de una elección).';
COMMENT ON COLUMN opciones_consulta.id_usuario_candidato IS 'Referencia al usuario si la opción es un candidato en una elección.';

-- -----------------------------------------------------------------------------
-- Tabla 31: respuestas_consulta
-- Registra el VOTO o respuesta de un usuario a una consulta específica.
-- -----------------------------------------------------------------------------
CREATE TABLE respuestas_consulta (
  id BIGSERIAL PRIMARY KEY,
  id_consulta INTEGER NOT NULL REFERENCES consultas_populares(id) ON DELETE CASCADE,
  id_afiliacion_votante INTEGER NOT NULL REFERENCES afiliaciones(id) ON DELETE CASCADE,
  id_opcion_elegida INTEGER REFERENCES opciones_consulta(id) ON DELETE CASCADE,
  respuesta_abierta TEXT,
  fecha_respuesta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_consulta, id_afiliacion_votante)
);
COMMENT ON TABLE respuestas_consulta IS 'Registra el VOTO o respuesta de un usuario a una consulta específica, asegurando unicidad.';

-- -----------------------------------------------------------------------------
-- Tabla 32: incidencias
-- Sistema de TICKETING jerárquico para reportar problemas.
-- -----------------------------------------------------------------------------
CREATE TABLE incidencias (
  id SERIAL PRIMARY KEY,
  id_afiliacion_reporta INTEGER NOT NULL REFERENCES afiliaciones(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('condominio', 'plataforma')),
  estado VARCHAR(50) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_proceso', 'resuelto', 'cerrado', 'escalado')),
  id_ticket_padre INTEGER REFERENCES incidencias(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE incidencias IS 'Sistema de TICKETING jerárquico para reportar problemas.';

-- -----------------------------------------------------------------------------
-- Tabla 33: cartas
-- Registro de las solicitudes y la emisión de DOCUMENTOS formales.
-- -----------------------------------------------------------------------------
CREATE TABLE cartas (
    id SERIAL PRIMARY KEY,
    id_afiliacion_solicitante INTEGER NOT NULL REFERENCES afiliaciones(id) ON DELETE CASCADE,
    tipo_carta VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'solicitada' CHECK (estado IN ('solicitada', 'en_proceso', 'emitida', 'rechazada')),
    id_archivo_generado INTEGER REFERENCES archivos(id) ON DELETE SET NULL,
    fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_emision TIMESTAMPTZ
);
COMMENT ON TABLE cartas IS 'Registro de las solicitudes y la emisión de DOCUMENTOS formales (ej. cartas de solvencia).';


-- -----------------------------------------------------------------------------
-- ADR-001: Modelo de Roles y Afiliaciones para el MVP
-- -----------------------------------------------------------------------------
-- Añadimos la columna 'rol' con un valor por defecto seguro.
ALTER TABLE usuarios
ADD COLUMN rol VARCHAR(50) NOT NULL DEFAULT 'residente';

-- Añadimos la columna que vinculará a un usuario con su edificio principal para el MVP.
-- La hacemos NULABLE porque un dueño_app no pertenece a ningún edificio.
ALTER TABLE usuarios
ADD COLUMN id_edificio_actual INTEGER REFERENCES edificios(id) ON DELETE SET NULL;

-- Documentamos las columnas para nuestro yo del futuro
COMMENT ON COLUMN usuarios.rol IS 'ADR-001: Rol simplificado para V1. A ser migrado a tabla "afiliaciones" en V2.';
COMMENT ON COLUMN usuarios.id_edificio_actual IS 'ADR-001: ID del edificio principal del usuario para V1. A ser migrado a tabla "afiliaciones" en V2.';

-- Le damos el rol de 'dueño_app' a nuestro usuario principal para poder probar.
-- Reemplaza con tu email.
UPDATE usuarios SET rol = 'dueño_app' WHERE email = 'juliorhode@gmail.com';

select * from usuarios where email='juliorhode@gmail.com';

-- ver la informacion de una tabla
SELECT table_catalog , column_name, column_default, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'usuarios';

DROP DATABASE IF EXISTS lifebit_dev;
commit;
CREATE DATABASE lifebit_dev;

-- verificar las conexiones
SELECT * FROM pg_stat_activity;

-- expulsar la conexion
SELECT pg_terminate_backend(64245);
SELECT pg_terminate_backend(64247);
SELECT pg_terminate_backend(64384);
SELECT pg_terminate_backend(65387);


