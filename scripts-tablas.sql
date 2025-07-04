-- ###############################################################
-- #         Script de Creación de Esquema LifeBit               #
-- ###############################################################

-- Tabla 1: usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  contraseña VARCHAR(255),
  telefono VARCHAR(50),
  cedula VARCHAR(20) UNIQUE,
  google_id VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(255),
  token_registro VARCHAR(255) UNIQUE,
  token_expiracion TIMESTAMPTZ,
  estado VARCHAR(50) DEFAULT 'invitado' NOT NULL,
  fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMPTZ
);
COMMENT ON TABLE usuarios IS 'Almacena el perfil individual de cada persona en la plataforma.';
COMMENT ON COLUMN usuarios.contraseña IS 'Almacenada como un hash seguro (bcrypt). NULL si usa OAuth.';
COMMENT ON COLUMN usuarios.google_id IS 'ID único proporcionado por Google para OAuth.';
COMMENT ON COLUMN usuarios.token_registro IS 'Token de un solo uso para finalizar el registro.';
COMMENT ON COLUMN usuarios.estado IS 'Posibles valores: invitado, activo, suspendido.';

-- Tabla 2: planes
CREATE TABLE planes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  precio_mensual NUMERIC(10, 2) NOT NULL,
  descripcion TEXT
);
COMMENT ON TABLE planes IS 'Catálogo de los planes de suscripción que ofrece LifeBit.';

-- Tabla 3: edificios
CREATE TABLE edificios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE edificios IS 'Entidad central que representa a cada cliente (condominio).';

-- Tabla 4: unidades
CREATE TABLE unidades (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  numero_unidad VARCHAR(50) NOT NULL,
  tipo VARCHAR(50),
  metros_cuadrados NUMERIC(10, 2),
  UNIQUE (id_edificio, numero_unidad)
);
COMMENT ON TABLE unidades IS 'Representa una unidad individual (apartamento, local) dentro de un edificio.';
COMMENT ON COLUMN unidades.tipo IS 'Ej: apartamento, local, galpon.';

-- Tabla 5: areas_comunes
CREATE TABLE areas_comunes (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  capacidad INTEGER,
  horario_disponible TEXT,
  tarifa_por_hora NUMERIC(10, 2)
);
COMMENT ON TABLE areas_comunes IS 'Define las áreas comunes disponibles para reserva en un edificio.';

-- Tabla 6: suscripciones
CREATE TABLE suscripciones (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL UNIQUE REFERENCES edificios(id) ON DELETE CASCADE,
  id_plan INTEGER NOT NULL REFERENCES planes(id),
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(50) NOT NULL
);
COMMENT ON TABLE suscripciones IS 'Registra el contrato de servicio entre un edificio y un plan de LifeBit.';
COMMENT ON COLUMN suscripciones.estado IS 'Ej: activa, suspendida, cancelada.';

-- Tabla 7: membresias
CREATE TABLE membresias (
  id SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  id_unidad INTEGER REFERENCES unidades(id) ON DELETE SET NULL,
  rol VARCHAR(50) NOT NULL,
  es_propietario BOOLEAN DEFAULT false,
  es_arrendatario BOOLEAN DEFAULT false,
  UNIQUE(id_usuario, id_edificio, id_unidad, rol)
);
COMMENT ON TABLE membresias IS 'Tabla de unión clave que define el rol de un usuario en un edificio/unidad.';
COMMENT ON COLUMN membresias.rol IS 'Ej: dueño_app, gestor, administrador, residente.';

-- Tabla 8: items_cobro
CREATE TABLE items_cobro (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(50),
  metodo_calculo VARCHAR(50)
);
COMMENT ON TABLE items_cobro IS 'Catálogo de conceptos que se pueden facturar en un recibo.';
COMMENT ON COLUMN items_cobro.categoria IS 'Ej: cuota, mantenimiento, servicio, multa, area_comun.';
COMMENT ON COLUMN items_cobro.metodo_calculo IS 'Ej: fijo, por metro, porcentaje.';

-- Tabla 9: gastos
CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  monto NUMERIC(12, 2) NOT NULL,
  fecha DATE NOT NULL,
  categoria VARCHAR(50),
  url_factura VARCHAR(255)
);
COMMENT ON TABLE gastos IS 'Registra los egresos o gastos incurridos por un condominio.';

-- Tabla 10: tasas_cambio
CREATE TABLE tasas_cambio (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL UNIQUE,
  tasa NUMERIC(20, 10) NOT NULL,
  fuente VARCHAR(50) DEFAULT 'manual'
);
COMMENT ON TABLE tasas_cambio IS 'Historial de las tasas de cambio para conversiones de moneda.';

-- Tabla 11: recibos
CREATE TABLE recibos (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL,
  año INTEGER NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  monto_total_gastos NUMERIC(12, 2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'borrador',
  UNIQUE(id_edificio, mes, año)
);
COMMENT ON TABLE recibos IS 'Representa la factura o recibo de condominio mensual general para un edificio.';
COMMENT ON COLUMN recibos.estado IS 'Ej: borrador, emitido, cerrado.';

-- Tabla 12: reglas
CREATE TABLE reglas (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  evento_disparador VARCHAR(100) NOT NULL,
  definicion JSONB NOT NULL,
  esta_activa BOOLEAN DEFAULT true,
  fecha_inicio_vigencia TIMESTAMPTZ,
  fecha_fin_vigencia TIMESTAMPTZ,
  descripcion TEXT
);
COMMENT ON TABLE reglas IS 'Almacena la lógica de negocio personalizada para cada condominio.';
COMMENT ON COLUMN reglas.definicion IS 'Estructura JSON que define las condiciones y acciones de la regla.';

-- Tabla 13: noticias
CREATE TABLE noticias (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER REFERENCES edificios(id) ON DELETE SET NULL,
  id_usuario_autor INTEGER NOT NULL REFERENCES usuarios(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50),
  fecha_publicacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE noticias IS 'Artículos o comunicados para los residentes. id_edificio NULL significa que es una noticia global de LifeBit.';

-- Tabla 14: auditoria
CREATE TABLE auditoria (
  id BIGSERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(255) NOT NULL,
  tabla_afectada VARCHAR(100),
  id_registro_afectado INTEGER,
  detalles JSONB,
  fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE auditoria IS 'Registro de acciones importantes realizadas en el sistema para trazabilidad.';

-- Tabla 15: cuentas_bancarias
CREATE TABLE cuentas_bancarias (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  banco VARCHAR(100) NOT NULL,
  numero_cuenta VARCHAR(50) NOT NULL,
  titular VARCHAR(255) NOT NULL,
  cedula_rif VARCHAR(20) NOT NULL,
  tipo_pago VARCHAR(50),
  telefono VARCHAR(50),
  activa BOOLEAN DEFAULT true
);
COMMENT ON TABLE cuentas_bancarias IS 'Cuentas bancarias del condominio para recibir pagos.';

-- Tabla 16: configuraciones
CREATE TABLE configuraciones (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  clave VARCHAR(100) NOT NULL,
  valor TEXT NOT NULL,
  UNIQUE(id_edificio, clave)
);
COMMENT ON TABLE configuraciones IS 'Almacena configuraciones específicas por edificio (ej. moneda_default, dias_gracia).';

-- Tabla 17: recibos_unidades
CREATE TABLE recibos_unidades (
  id SERIAL PRIMARY KEY,
  id_recibo INTEGER NOT NULL REFERENCES recibos(id) ON DELETE CASCADE,
  id_unidad INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  monto_calculado NUMERIC(12, 2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  UNIQUE(id_recibo, id_unidad)
);
COMMENT ON TABLE recibos_unidades IS 'Detalle de la deuda de una unidad específica para un recibo mensual.';
COMMENT ON COLUMN recibos_unidades.estado IS 'Ej: pendiente, pagado, pagado_parcialmente.';

-- Tabla 18: discusiones
CREATE TABLE discusiones (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  id_usuario_creador INTEGER NOT NULL REFERENCES usuarios(id),
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT,
  estado VARCHAR(50) DEFAULT 'abierta',
  fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE discusiones IS 'Hilos de conversación en el foro.';
COMMENT ON COLUMN discusiones.estado IS 'Ej: abierta, cerrada.';

-- Tabla 19: encuestas
CREATE TABLE encuestas (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER REFERENCES edificios(id) ON DELETE SET NULL,
  id_usuario_creador INTEGER NOT NULL REFERENCES usuarios(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  estado VARCHAR(50) DEFAULT 'borrador'
);
COMMENT ON TABLE encuestas IS 'Encuestas de sondeo (abiertas) o de opción múltiple (cerradas).';
COMMENT ON COLUMN encuestas.tipo IS 'Ej: sondeo, votacion_simple.';

-- Tabla 20: votaciones
CREATE TABLE votaciones (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  id_usuario_creador INTEGER NOT NULL REFERENCES usuarios(id),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMptZ,
  fecha_fin TIMESTAMPTZ,
  estado VARCHAR(50) DEFAULT 'borrador'
);
COMMENT ON TABLE votaciones IS 'Procesos de votación formales, como elecciones de junta.';

-- Tabla 21: detalles_recibos_unidades
CREATE TABLE detalles_recibos_unidades (
  id SERIAL PRIMARY KEY,
  id_recibo_unidad INTEGER NOT NULL REFERENCES recibos_unidades(id) ON DELETE CASCADE,
  id_item_cobro INTEGER REFERENCES items_cobro(id) ON DELETE SET NULL,
  id_gasto INTEGER REFERENCES gastos(id) ON DELETE SET NULL,
  descripcion VARCHAR(255) NOT NULL,
  monto NUMERIC(12, 2) NOT NULL
);
COMMENT ON TABLE detalles_recibos_unidades IS 'Desglose línea por línea de lo que se cobra en un recibo de una unidad.';

-- Tabla 22: pagos
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  id_usuario_pagador INTEGER NOT NULL REFERENCES usuarios(id),
  id_recibo_unidad INTEGER REFERENCES recibos_unidades(id) ON DELETE SET NULL,
  monto_pagado NUMERIC(12, 2) NOT NULL,
  moneda_pago VARCHAR(10) NOT NULL,
  id_tasa_cambio INTEGER REFERENCES tasas_cambio(id),
  fecha_pago DATE NOT NULL,
  metodo_pago VARCHAR(50),
  referencia VARCHAR(100),
  url_comprobante VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'en_verificacion',
  notas_verificacion TEXT
);
COMMENT ON TABLE pagos IS 'Registro de un pago realizado por un usuario.';
COMMENT ON COLUMN pagos.estado IS 'Ej: en_verificacion, validado, rechazado.';

-- Tabla 23: notificaciones
CREATE TABLE notificaciones (
  id BIGSERIAL PRIMARY KEY,
  id_usuario_destinatario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(50),
  url_destino VARCHAR(255), -- URL a la que redirige la notificación
  estado VARCHAR(50) DEFAULT 'pendiente',
  leida BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE notificaciones IS 'Registro de notificaciones enviadas a los usuarios (email, push, etc).';

-- Tabla 24: preguntas_encuestas
CREATE TABLE preguntas_encuestas (
  id SERIAL PRIMARY KEY,
  id_encuesta INTEGER NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL
);
COMMENT ON TABLE preguntas_encuestas IS 'Preguntas específicas dentro de una encuesta.';
COMMENT ON COLUMN preguntas_encuestas.tipo IS 'Ej: seleccion_unica, seleccion_multiple, texto_abierto.';

-- Tabla 25: candidatos
CREATE TABLE candidatos (
  id SERIAL PRIMARY KEY,
  id_votacion INTEGER NOT NULL REFERENCES votaciones(id) ON DELETE CASCADE,
  id_miembro_candidato INTEGER NOT NULL REFERENCES membresias(id) ON DELETE CASCADE,
  eslogan TEXT,
  plan_estrategico TEXT,
  foto_url VARCHAR(255),
  UNIQUE(id_votacion, id_miembro_candidato)
);
COMMENT ON TABLE candidatos IS 'Registra las candidaturas para una elección de junta de condominio.';

-- Tabla 26: votos
CREATE TABLE votos (
  id SERIAL PRIMARY KEY,
  id_votacion INTEGER NOT NULL REFERENCES votaciones(id) ON DELETE CASCADE,
  id_miembro_votante INTEGER NOT NULL REFERENCES membresias(id) ON DELETE CASCADE,
  id_candidato INTEGER REFERENCES candidatos(id) ON DELETE CASCADE,
  opcion_elegida VARCHAR(50),
  fecha_voto TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_votacion, id_miembro_votante)
);
COMMENT ON TABLE votos IS 'Registro de un voto emitido por un miembro en una votación o elección.';
COMMENT ON COLUMN votos.opcion_elegida IS 'Para votaciones simples (Si/No/Abstencion).';

-- Tabla 27: respuestas_discusiones
CREATE TABLE respuestas_discusiones (
  id SERIAL PRIMARY KEY,
  id_discusion INTEGER NOT NULL REFERENCES discusiones(id) ON DELETE CASCADE,
  id_usuario_autor INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_respuesta_padre INTEGER REFERENCES respuestas_discusiones(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE respuestas_discusiones IS 'Comentarios y respuestas dentro de un hilo del foro.';
COMMENT ON COLUMN respuestas_discusiones.id_respuesta_padre IS 'Para anidar comentarios y crear hilos de respuesta.';

-- Tabla 28: reservas
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  id_area_comun INTEGER NOT NULL REFERENCES areas_comunes(id),
  id_miembro_solicitante INTEGER NOT NULL REFERENCES membresias(id),
  fecha_reserva DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  motivo_rechazo TEXT,
  fecha_solicitud TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id_area_comun, fecha_reserva, hora_inicio)
);
COMMENT ON TABLE reservas IS 'Solicitudes de reserva de áreas comunes.';
COMMENT ON COLUMN reservas.estado IS 'Ej: pendiente, aprobada, rechazada, cancelada.';

-- Tabla 29: multas
CREATE TABLE multas (
  id SERIAL PRIMARY KEY,
  id_unidad INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  id_recibo_unidad INTEGER REFERENCES recibos_unidades(id) ON DELETE SET NULL,
  monto NUMERIC(12, 2) NOT NULL,
  motivo TEXT NOT NULL,
  fecha_aplicacion DATE NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente'
);
COMMENT ON TABLE multas IS 'Registro de penalizaciones o multas aplicadas a una unidad.';
COMMENT ON COLUMN multas.id_recibo_unidad IS 'Enlaza la multa al recibo donde se está cobrando.';

-- Tabla 30: reportes_financieros
CREATE TABLE reportes_financieros (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  url_documento VARCHAR(255),
  fecha_generacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE reportes_financieros IS 'Almacena enlaces a reportes generados (PDF, Excel).';
COMMENT ON COLUMN reportes_financieros.tipo IS 'Ej: balance_general, estado_de_ganancias_y_perdidas.';

-- Tabla 31: opciones_preguntas
CREATE TABLE opciones_preguntas (
  id SERIAL PRIMARY KEY,
  id_pregunta INTEGER NOT NULL REFERENCES preguntas_encuestas(id) ON DELETE CASCADE,
  texto_opcion VARCHAR(255) NOT NULL
);
COMMENT ON TABLE opciones_preguntas IS 'Opciones predefinidas para preguntas de selección en una encuesta.';

-- Tabla 32: respuestas_encuestas
CREATE TABLE respuestas_encuestas (
  id SERIAL PRIMARY KEY,
  id_pregunta INTEGER NOT NULL REFERENCES preguntas_encuestas(id) ON DELETE CASCADE,
  id_miembro_encuestado INTEGER NOT NULL REFERENCES membresias(id) ON DELETE CASCADE,
  id_opcion_elegida INTEGER REFERENCES opciones_preguntas(id) ON DELETE CASCADE,
  respuesta_abierta TEXT,
  UNIQUE(id_pregunta, id_miembro_encuestado)
);
COMMENT ON TABLE respuestas_encuestas IS 'Almacena la respuesta de un miembro a una pregunta de una encuesta.';

-- Tabla 33: pagos_licencias
CREATE TABLE pagos_licencias (
  id SERIAL PRIMARY KEY,
  id_suscripcion INTEGER NOT NULL REFERENCES suscripciones(id),
  id_pago INTEGER NOT NULL UNIQUE REFERENCES pagos(id)
);
COMMENT ON TABLE pagos_licencias IS 'Tabla de unión que vincula un pago específico al pago de una suscripción de servicio.';

-- Tabla 34: historial_validacion
CREATE TABLE historial_validacion (
  id SERIAL PRIMARY KEY,
  id_pago INTEGER NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
  id_usuario_validador INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50) NOT NULL,
  detalle TEXT,
  fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE historial_validacion IS 'Log de los cambios de estado de un pago durante el proceso de conciliación.';

-- Tabla 35: cartas_solvencia
CREATE TABLE cartas_solvencia (
  id SERIAL PRIMARY KEY, -- Mantenemos un ID numérico como clave primaria interna.
  id_unidad INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  -- El UUID es nuestra clave PÚBLICA, debe ser única y no nula.
  codigo_verificacion UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  fecha_emision TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  periodo_cubierto VARCHAR(100),
  estado VARCHAR(50) NOT NULL,
  url_documento VARCHAR(255)
);
COMMENT ON TABLE cartas_solvencia IS 'Registro de cartas de solvencia emitidas para una unidad.';
COMMENT ON COLUMN cartas_solvencia.codigo_verificacion IS 'UUID único para verificación pública y externa de la carta.';

-- Tabla 36: historial_solvencias
CREATE TABLE historial_solvencias (
  id SERIAL PRIMARY KEY,
  id_carta_solvencia UUID NOT NULL REFERENCES cartas_solvencia(codigo_verificacion),
  id_unidad INTEGER NOT NULL REFERENCES unidades(id),
  estado VARCHAR(50),
  fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE historial_solvencias IS 'Log histórico de los estados de una carta de solvencia.';

-- Tabla 37: recursos_unidades
CREATE TABLE recursos_unidades (
  id SERIAL PRIMARY KEY,
  id_unidad INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  identificador VARCHAR(100),
  descripcion TEXT,
  activo BOOLEAN DEFAULT true
);
COMMENT ON TABLE recursos_unidades IS 'Recursos asignados a una unidad (ej. puesto de estacionamiento, llave magnética).';

-- Tabla 38: contenido_edificios
CREATE TABLE contenido_edificios (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  id_usuario_autor INTEGER NOT NULL REFERENCES usuarios(id),
  seccion VARCHAR(100) NOT NULL,
  contenido_html TEXT,
  activa BOOLEAN DEFAULT true,
  fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE contenido_edificios IS 'Contenido tipo CMS específico para un edificio (ej. reglamento, contacto).';

-- Tabla 39: contenido_landing
CREATE TABLE contenido_landing (
  id SERIAL PRIMARY KEY,
  id_usuario_autor INTEGER NOT NULL REFERENCES usuarios(id),
  seccion VARCHAR(100) NOT NULL UNIQUE,
  contenido_html TEXT,
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE contenido_landing IS 'Contenido del CMS para la Landing Page principal de LifeBit.';
COMMENT ON COLUMN contenido_landing.orden IS 'Para la funcionalidad de drag-and-drop y reordenar secciones.';

-- Tabla 40: servicios_compartidos
CREATE TABLE servicios_compartidos (
  id SERIAL PRIMARY KEY,
  id_edificio INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  costo_mensual NUMERIC(12, 2)
);

-- Tabla 41: unidades_servicios_compartidos (Tabla de unión Muchos a Muchos)
CREATE TABLE unidades_servicios_compartidos (
  id_unidad INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  id_servicio INTEGER NOT NULL REFERENCES servicios_compartidos(id) ON DELETE CASCADE,
  PRIMARY KEY (id_unidad, id_servicio)
);
COMMENT ON TABLE unidades_servicios_compartidos IS 'Vincula qué unidades participan en un servicio compartido.';










