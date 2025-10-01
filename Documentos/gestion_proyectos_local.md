# Linear Local: Sistema de Gestión de Proyectos para LifeBit

Este archivo simula Linear.app localmente, replicando proyectos, epics, issues, roadmaps, asignaciones y checklists. Usa IDs únicos, estados, prioridades y etiquetas. Actualiza manualmente o con IA.

## Espacios de Trabajo (Equivalente a Equipos en Linear)
- **Equipo Backend**: Desarrollo backend (ID: BT-001)
- **Equipo Frontend**: Desarrollo frontend (ID: FT-001)
- **Equipo Seguridad**: Auditorías y seguridad (ID: ST-001)
- **Gestión de Proyectos**: Planificación y métricas (ID: PM-001)

## Proyectos
### Proyecto: Desarrollo SaaS LifeBit (ID: PROJ-001)
**Descripción**: Desarrollo completo de la plataforma SaaS para gestión de condominios.
**Estado**: Iniciado
**Líder**: Julio (Gestor de Proyecto)
**Fecha Inicio**: 2025-08-01
**Fecha Estimada Fin**: 2025-12-31
**Prioridad**: Alta
**Etiquetas**: SaaS, Condominios, MVP

#### Roadmaps
- **Roadmap Maestro LifeBit** (ID: ROAD-001)
  - Hito 1: Fundación (Completado, 2025-08-15)
  - Hito 2: Autenticación Completa (En Progreso, 2025-10-15)
  - Hito 3: Panel Dueño (Pendiente, 2025-11-15)
  - Hito 4: Núcleo Financiero (Pendiente, 2025-12-15)

#### Epics (Epopeyas)
##### Epic: Epopeya 0 - Fundación del Proyecto (CORE) (ID: EPIC-001)
**Estado**: Completado
**Descripción**: Establecer base sólida.
**Asignado**: Equipo Backend
**Modelo IA**: Grok Code Fast 1
**Issues Vinculados**: ISSUE-001 a ISSUE-006

##### Epic: Epopeya 1 - Autenticación y Ciclo de Vida del Usuario (ID: EPIC-002)
**Estado**: Iniciado
**Descripción**: Implementar login, registro y gestión usuarios.
**Asignado**: Equipo Backend
**Modelo IA**: Grok Code Fast 1
**Issues Vinculados**: ISSUE-007 a ISSUE-024

##### Epic: Epopeya 2 - Panel del Dueño (Gestión SaaS) (ID: EPIC-003)
**Estado**: Iniciado
**Descripción**: Dashboard y herramientas para dueño.
**Asignado**: Equipo Backend
**Modelo IA**: DeepSeek R1 0528
**Issues Vinculados**: ISSUE-025 a ISSUE-031

##### Epic: Epopeya 3 - Panel Administrador (Configuración) (ID: EPIC-004)
**Estado**: Completado
**Descripción**: Configuración inicial del edificio.
**Asignado**: Equipo Backend
**Modelo IA**: Grok Code Fast 1
**Issues Vinculados**: ISSUE-032 a ISSUE-037

##### Epic: Epopeya 4 - El Núcleo Financiero (ID: EPIC-005)
**Estado**: Pendiente
**Descripción**: Sistema contable y pagos.
**Asignado**: Equipo Backend
**Modelo IA**: Grok Code Fast 1
**Issues Vinculados**: ISSUE-038 a ISSUE-044

##### Epic: Epopeya 5 - Comunidad y Participación (ID: EPIC-006)
**Estado**: Pendiente
**Descripción**: Foro, encuestas, elecciones.
**Asignado**: Equipo Frontend
**Modelo IA**: Qwen3 Coder
**Issues Vinculados**: ISSUE-045 a ISSUE-049

##### Epic: Epopeya 6 - Soporte y Automatización (ID: EPIC-007)
**Estado**: Pendiente
**Descripción**: Incidencias y motor de reglas.
**Asignado**: Equipo Seguridad
**Modelo IA**: DeepSeek R1 0528
**Issues Vinculados**: ISSUE-050 a ISSUE-052

##### Epic: Epopeya 7 - Panel del Residente (ID: EPIC-008)
**Estado**: Pendiente
**Descripción**: Interfaz para residentes.
**Asignado**: Equipo Frontend
**Modelo IA**: Qwen3 Coder
**Issues Vinculados**: ISSUE-053 a ISSUE-060

##### Epic: Epopeya 8 - Seguridad Avanzada y Hardening (ID: EPIC-010)
**Estado**: Pendiente
**Descripción**: Reforzar postura de seguridad.
**Asignado**: Equipo Seguridad
**Modelo IA**: DeepSeek R1
**Issues Vinculados**: ISSUE-088 a ISSUE-091

##### Epic: Epopeya 9 - Mantenimiento y Escalabilidad (ID: EPIC-009)
**Estado**: Pendiente
**Descripción**: Mejoras técnicas.
**Asignado**: Equipo Backend
**Modelo IA**: Grok Code Fast 1
**Issues Vinculados**: ISSUE-061 a ISSUE-064

## Issues (Tareas Detalladas)
Cada issue simula un ticket en Linear con ID, título, descripción, estado, asignado, prioridad, etiquetas.

- **ISSUE-001**: Estructura de carpetas profesional (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Configuración)
- **ISSUE-002**: Conexión BD PostgreSQL (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: BD)
- **ISSUE-003**: Servidor Express y middlewares (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Configuración)
- **ISSUE-004**: Variables de entorno (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Config)
- **ISSUE-005**: Manejador errores global (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Manejo Errores)
- **ISSUE-006**: Scripts inicialización BD (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: BD)
- **ISSUE-007**: Modelo datos MVP (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Auth)
- **ISSUE-008**: Login tradicional (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Auth)
- **ISSUE-009**: Generación JWT (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Auth)
- **ISSUE-010**: Middlewares seguridad (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Seguridad)
- **ISSUE-011**: Servicio emails (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Email)
- **ISSUE-012**: Flujo invitación con token (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Auth)
- **ISSUE-013**: Flujo finalizar registro (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Auth)
- **ISSUE-014**: Endpoint invitación individual residente (Estado: Completado, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Auth)
- **ISSUE-015**: Endpoint invitación masiva residentes (Estado: Completado, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Auth)
- **ISSUE-016**: Worker encola trabajos envío email masivo (Estado: Completado, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Auth)
- **ISSUE-017**: CRUD residentes (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: CRUD)
- **ISSUE-018**: Recuperación contraseña (Estado: Completado, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Auth)
- **ISSUE-019**: Cambio contraseña usuario logueado (Estado: Completado, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Auth)
- **ISSUE-020**: Integración Google OAuth 2.0 (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Auth)
- **ISSUE-021**: Flujo cambio email seguro (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Auth)
- **ISSUE-022**: Protección contra fuerza bruta (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Alta, Etiquetas: Seguridad)
- **ISSUE-023**: Validación fortaleza contraseña backend (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Auth)
- **ISSUE-024**: Endpoint GET /api/perfil/me (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Perfil)
- **ISSUE-025**: Endpoint PATCH /api/perfil/me (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Perfil)
- **ISSUE-026**: Flujo vincular Google (Estado: Completado, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Auth)
- **ISSUE-027**: Flujo desvincular Google (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Auth)
- **ISSUE-028**: Flujo onboarding clientes (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: SaaS)
- **ISSUE-029**: Gestión edificios (Estado: Iniciado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: CRUD)
- **ISSUE-030**: CRUD licencias (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: SaaS)
- **ISSUE-031**: Dashboard dueño (Estado: Pendiente, Asignado: Gestión de Proyectos, Prioridad: Alta, Etiquetas: Dashboard)
- **ISSUE-032**: Módulo noticias globales (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Noticias)
- **ISSUE-033**: Herramienta soporte nivel 2 (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Alta, Etiquetas: Soporte)
- **ISSUE-034**: Módulo CMS landing page (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: CMS)
- **ISSUE-035**: Mecanismo estados configuración edificio (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Config)
- **ISSUE-036**: Gestión unidades habitacionales (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: CRUD)
- **ISSUE-037**: Gestión tipos recurso (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: CRUD)
- **ISSUE-038**: Gestión inventario recursos (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: CRUD)
- **ISSUE-039**: Asignación recursos (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: CRUD)
- **ISSUE-040**: Endpoints lectura configuración (Estado: Completado, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: API)
- **ISSUE-041**: Gestión cuentas bancarias admin (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Finanzas)
- **ISSUE-042**: Gestión gastos CRUD (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Finanzas)
- **ISSUE-043**: Generación recibos condominio (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Crítica, Etiquetas: Finanzas)
- **ISSUE-044**: Flujo pagos residente (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Finanzas)
- **ISSUE-045**: Conciliación pagos admin (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Finanzas)
- **ISSUE-046**: Gestión multas CRUD (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Finanzas)
- **ISSUE-047**: Módulo contable partida doble (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Crítica, Etiquetas: Finanzas)
- **ISSUE-048**: Módulo noticias condominio (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Media, Etiquetas: Noticias)
- **ISSUE-049**: Foro discusiones (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Media, Etiquetas: Comunidad)
- **ISSUE-050**: Módulo consultas unificado (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Alta, Etiquetas: Comunidad)
- **ISSUE-051**: Gestión áreas comunes CRUD (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: CRUD)
- **ISSUE-052**: Módulo reservas áreas comunes (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Media, Etiquetas: Reservas)
- **ISSUE-053**: Sistema incidencias jerárquico (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Alta, Etiquetas: Soporte)
- **ISSUE-054**: Gestión cartas documentos (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Documentos)
- **ISSUE-055**: Motor reglas (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Automatización)
- **ISSUE-056**: Dashboard residente (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Alta, Etiquetas: Dashboard)
- **ISSUE-057**: Módulo pagos residente (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Alta, Etiquetas: Finanzas)
- **ISSUE-058**: Módulo reservas residente (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Media, Etiquetas: Reservas)
- **ISSUE-059**: Módulo votaciones/encuestas residente (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Media, Etiquetas: Comunidad)
- **ISSUE-060**: Módulo discusiones residente (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Baja, Etiquetas: Comunidad)
- **ISSUE-061**: Módulo elecciones residente (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Media, Etiquetas: Comunidad)
- **ISSUE-062**: Módulo solicitud cartas (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Baja, Etiquetas: Documentos)
- **ISSUE-063**: Módulo reporte incidencias (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Media, Etiquetas: Soporte)
- **ISSUE-064**: Módulo auditoría (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Automatización)
- **ISSUE-065**: Migrar servicio email a AWS SES (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Mantenimiento)
- **ISSUE-066**: Implementar modelo 'afiliaciones' (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Refactor)
- **ISSUE-067**: Implementar verificación SMS OTP (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Media, Etiquetas: Seguridad)
- **ISSUE-068**: Refactorizar a arquitectura microservicios (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Arquitectura)

## Issues Adicionales: Documentación
- **ISSUE-069**: Documentar API endpoints autenticación (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Documentación)
- **ISSUE-070**: Documentar API endpoints perfil usuario (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Documentación)
- **ISSUE-071**: Documentar API endpoints gestión SaaS (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Documentación)
- **ISSUE-072**: Documentar API endpoints configuración admin (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Documentación)
- **ISSUE-073**: Documentar API endpoints núcleo financiero (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Documentación)
- **ISSUE-074**: Documentar API endpoints comunidad (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Media, Etiquetas: Documentación)
- **ISSUE-075**: Documentar API endpoints soporte (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Baja, Etiquetas: Documentación)
- **ISSUE-076**: Actualizar README con guía instalación (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Documentación)
- **ISSUE-077**: Crear documentación arquitectura sistema (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Documentación)

## Issues Adicionales: Testing
- **ISSUE-078**: Tests unitarios controladores autenticación (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Testing)
- **ISSUE-079**: Tests unitarios servicios email (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Testing)
- **ISSUE-080**: Tests integración flujo registro/login (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Testing)
- **ISSUE-081**: Tests unitarios controladores perfil (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Baja, Etiquetas: Testing)
- **ISSUE-082**: Tests integración gestión edificios (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Testing)
- **ISSUE-083**: Tests unitarios motor reglas (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Testing)
- **ISSUE-084**: Tests integración núcleo financiero (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Crítica, Etiquetas: Testing)
- **ISSUE-085**: Tests e2e flujo completo residente (Estado: Pendiente, Asignado: Equipo Frontend, Prioridad: Alta, Etiquetas: Testing)
- **ISSUE-086**: Tests e2e flujo completo admin (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Alta, Etiquetas: Testing)
- **ISSUE-087**: Configurar CI/CD con tests automáticos (Estado: Pendiente, Asignado: Equipo Backend, Prioridad: Media, Etiquetas: Testing)

## Issues Adicionales: Seguridad Avanzada
- **ISSUE-088**: Cabeceras de Seguridad HTTP (helmet) (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Alta, Etiquetas: Seguridad)
- **ISSUE-089**: Limitación de Tasa y Bloqueo de Cuentas (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Alta, Etiquetas: Seguridad)
- **ISSUE-090**: Verificación por SMS OTP (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Media, Etiquetas: Seguridad)
- **ISSUE-091**: Saneamiento de Contenido Enriquecido (Estado: Pendiente, Asignado: Equipo Seguridad, Prioridad: Media, Etiquetas: Seguridad)

## Asignaciones de Modelos IA por Rol (de AGENTS.md)
- **Gestor de Proyecto**: DeepSeek R1 0528 (free) - Razonamiento lógico, planificación.
- **CEO / Estratega Negocio**: Z.AI GLM 4.5 Air (free) - Análisis estratégico.
- **Especialista Marketing**: MoonshotAI Kimi K2 (free) - Creatividad, persuasión.
- **Especialista Ciberseguridad**: DeepSeek R1 0528 (free) - Análisis detallado.
- **Agente Alex (Backend)**: Grok Code Fast 1 - Codificación backend.
- **Agente Ark (Frontend)**: Qwen3 Coder (free) - Codificación frontend.

## Cómo Usar Linear Local
1. **Crear Issue**: Agrega nueva línea con ID único (ej. ISSUE-069), título, estado Pendiente.
2. **Actualizar Estado**: Cambia estado (Pendiente -> Por Hacer -> En Progreso -> Completado).
3. **Asignar**: Especifica equipo/rol y modelo IA.
4. **Con IA**: Prompt: "Crea issue en gestion_proyectos_local.md para tarea X con ID ISSUE-YYY."
5. **Commits**: Commitea para historial.
6. **Revisiones**: Julio aprueba cambios.

Última actualización: 2025-10-01