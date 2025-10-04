# Artefacto Maestro Definitivo: El Blueprint de "LifeBit" (v1.1)

Este documento es la fuente única y definitiva de verdad para el proyecto "LifeBit". Contiene la visión del producto, los flujos de trabajo detallados, los roadmaps de desarrollo sincronizados para backend y frontend, y el esquema completo de la base de datos. Está diseñado para permitir la continuación del desarrollo desde cualquier punto sin pérdida de contexto.

## Parte 1: Visión y Concepto del Producto

### 1.1. Propósito Central
LifeBit es una plataforma SaaS (Software as a Service) diseñada para ser el sistema operativo central de la gestión de condominios. Su misión es reemplazar procesos manuales y fragmentados con una solución digital, intuitiva y transparente, mejorando la eficiencia administrativa y la calidad de vida en la comunidad.

### 1.2. Stack Tecnológico
*   **Backend:** Node.js con el framework Express.
*   **Base de Datos:** PostgreSQL.
*   **Frontend:** React (utilizando la herramienta de construcción Vite).
*   **Despliegue:** Arquitectura orientada a la nube (AWS).

### 1.3. Principio de Desarrollo Sincronizado
El desarrollo se realizará mediante "rebanadas verticales". Por cada funcionalidad clave completada en el backend (ej. un conjunto de endpoints de API), se construirá inmediatamente la vista o componente correspondiente en el frontend de React para consumirla y probarla de principio a fin.

---

## Parte 2: Roles de Usuario y Flujos de Trabajo Clave

### 2.1. Roles Fundamentales
*   **Dueño de la App:** El administrador del sistema SaaS. Gestiona los clientes (edificios), las finanzas del negocio y el soporte de la plataforma.
*   **Administrador de Condominio:** El "power user". Gestiona la operativa diaria de uno o más edificios (para V2). Para el MVP, gestiona un solo edificio.
*   **Residente:** El usuario final. Interactúa con su comunidad y gestiona sus responsabilidades y servicios dentro del condominio.

### 2.2. Flujo de Onboarding (Alta de un Nuevo Edificio)
1.  **Solicitud:** Un cliente potencial llena un formulario en la Landing Page pública. Esta acción crea una `solicitud_servicio` con estado 'pendiente'.
2.  **Aprobación (Manual por el Dueño):** Un Dueño revisa la solicitud en su panel. Si la aprueba, el sistema ejecuta una transacción que crea el contrato, la licencia, el edificio, el usuario para el nuevo administrador (estado 'invitado') y la afiliacion que los vincula. Se genera un `token_registro` único.
3.  **Invitación:** El sistema envía un email al nuevo administrador con un enlace que contiene el token.
4.  **Finalización:** El administrador hace clic, es llevado a una página donde puede finalizar su registro, ya sea vinculando su cuenta de Google o creando su propia contraseña (que será hasheada con bcrypt). Su estado cambia a 'activo'.

### 2.3. Flujo de Registro de Residentes
Un Administrador autenticado utiliza la función de "Registro de Usuarios" (manual o masiva). Para cada residente, el sistema repite el proceso de invitación: crea un usuario ('invitado', rol 'residente'), genera un `token_registro` y envía el email.

### 2.4. Flujo Financiero Contable (Basado en Partida Doble)
1.  **Registro de Evento Operativo:** Un Admin registra un gasto en el sistema. O un Residente reporta un pago.
2.  **Validación:** El pago es conciliado y su estado cambia a 'validado'.
3.  **Generación de Asiento Contable:** El `ServicioContable` del backend se activa.
    *   Crea un registro en `asientos_contables` describiendo la transacción (ej. "Pago de cuota A-101").
    *   Crea al menos dos registros en `movimientos_contables` que balancean la ecuación. Ejemplo para un pago validado de $50:
        *   **Débito (DEBE):** +$50 a la cuenta `plan_de_cuentas` de "Banco" (Aumenta un Activo).
        *   **Crédito (HABER):** +$50 a la cuenta `plan_de_cuentas` de "Cuentas por Cobrar" (Disminuye un Activo).
4.  **Generación de Reportes:** La "Memoria y Cuenta" y otros reportes financieros se generan haciendo `SUM` sobre la tabla `movimientos_contables`, no sobre las tablas operativas.

### 2.5. Flujo de Traspaso de Poder Post-Elección
Tras una elección, el resultado es visible. El administrador saliente o, en su defecto, un Dueño, puede iniciar el proceso de traspaso. Sin embargo, la acción final de ejecutar el cambio de roles en la base de datos es una prerrogativa exclusiva del Dueño de LifeBit para garantizar la seguridad y el control. Ambas partes son notificadas por email.

### 2.6. Flujo de Incidencias (Ticketing Jerárquico)
*   **Residente -> Administrador:** Para problemas del condominio (ej. "fuga de agua"). Se crea una incidencia de tipo 'condominio'.
*   **Administrador -> Dueño:** Para problemas de la plataforma (ej. "bug en un reporte"). Se crea una incidencia de tipo 'plataforma'. Un admin puede "escalar" un ticket de residente, lo que crea un nuevo ticket de plataforma vinculado al original.

---

## Parte 3: Documentación Conceptual y Funcional

### 3.1. Visión General del Producto
LifeBit es una plataforma SaaS diseñada para modernizar y simplificar la gestión de condominios. Ofrece una experiencia de usuario intuitiva que centraliza operaciones financieras, administrativas y de comunicación, fomentando la transparencia y mejorando la calidad de vida en la comunidad.

### 3.2. Landing Page (Portal Público)
*   **Objetivo:** Ser la cara pública de LifeBit, actuando como herramienta de marketing, centro de información y embudo de captación de nuevos clientes.
*   **Estructura y Contenido:**
    *   **Header:** Logo, nombre de la marca, y un único botón de "Login".
    *   **Secciones Informativas:** Descripciones sobre la filosofía, características y propuesta de valor.
    *   **Planes y Servicios:** Presentación de los niveles de licencia (Básico, Gold, Premium).
    *   **Formulario de Contacto/Solicitud:** El principal "Call to Action" que inicia el proceso de onboarding.
*   **Flujo de Solicitud:** Un cliente potencial rellena el formulario, creando una "solicitud" que será revisada y aprobada manualmente por los Dueños.

### 3.3. Rol: Dueño de la Aplicación
*   **Objetivo:** Visión estratégica, control total de la plataforma, gestión de clientes y soporte de alto nivel.
*   **Dashboard:** Centro de control con alertas (solicitudes pendientes, pagos recibidos, incidencias).
*   **Financiero:** Herramienta de BI para la salud del negocio (clientes por zona/plan, estado de resultados).
*   **Contratos:** CRM para gestionar el ciclo de vida del cliente.
*   **Noticias:** Sistema de comunicación global o segmentada.
*   **Incidencias:** Sistema de ticketing de Nivel 2 para problemas de la plataforma.
*   **Pagos:** Panel de conciliación bancaria para los pagos de licencias.
*   **Encuestas:** Herramienta de investigación de mercado.
*   **Soporte:** Herramienta interna segura para ejecutar consultas SQL directas (con auditoría intensiva).
*   **Contenido (CMS):** Panel de control total sobre la Landing Page.

### 3.4. Rol: Administrador de Condominio
*   **Objetivo:** El "power user" que gestiona la vida diaria del condominio.
*   **Onboarding:** Invitado por un Dueño vía email con un token único para registrarse.
*   **Dashboard:** Centro de mando con resúmenes y alertas del edificio.
*   **Registro de Usuarios:** Herramienta para registrar residentes (manual o masivamente vía CSV/Excel).
*   **Financiero:** Panel de BI a nivel de condominio (ingresos, egresos, morosidad).
*   **Noticias:** CMS para publicar noticias a los residentes de su edificio.
*   **Recursos y Cuentas:** CRUDs para gestionar el inventario y las cuentas bancarias del edificio.
*   **Recibo y Multas:** Flujo de facturación mensual automatizado.
*   **Pagos:** Panel de conciliación para pagos de residentes y reporte de pago de licencia a LifeBit.
*   **Reglas:** Motor de automatización (Evento-Condición-Acción) para tareas lógicas.
*   **Participación:** Módulos de Discusiones, Encuestas, Votaciones, Elecciones.
*   **Traspaso de Poder:** Proceso seguro para el cambio de administrador, ejecutado por el Dueño.
*   **Reporte de Incidencias:** Canal para reportar problemas de la plataforma al Dueño.

### 3.5. Rol: Residente
*   **Objetivo:** El usuario final, enfocado en la conveniencia, información y participación.
*   **Onboarding:** Invitado por su administrador vía email con un token único.
*   **Dashboard:** Portal personalizado con pagos pendientes, estado de reservas, noticias y notificaciones.
*   **Financiero y Recibos:** Visualización clara de su estado de cuenta y deudas.
*   **Pagos:** Formulario para reportar pagos y adjuntar comprobantes.
*   **Participación:** Acceso a Noticias, Discusiones, Encuestas, Votaciones y Elecciones.
*   **Servicios:** Gestión de recursos asignados y reserva de áreas comunes.
*   **Soporte y Documentación:** Reporte de incidencias del condominio al administrador y solicitud de cartas de solvencia.
