# Guía Maestra de Onboarding para Agentes de IA - Proyecto LifeBit

Este documento es el protocolo estándar para incorporar una nueva instancia de un agente de IA (como Google Gemini, Anthropic Claude, etc.) al equipo de desarrollo de LifeBit. Su propósito es transferir el 100% del contexto del proyecto de forma rápida y eficiente.

## 1. El Principio Fundamental: Contexto Explícito

El problema más grande al cambiar de instancia de IA es la pérdida de contexto. La solución es **proporcionar todo el contexto de forma explícita** al inicio de la conversación. No asumas que la nueva instancia sabe algo.

### ¿Por qué Alex puede acceder a GitHub y otros no?

La capacidad de un agente de IA para acceder a URLs externas (como GitHub) es una **característica de la plataforma** donde se ejecuta, no algo que nosotros podamos configurar.
*   **Agente "Alex" (Plataforma Actual):** Tiene una herramienta interna de "navegación segura" que le permite leer el contenido de URLs públicas.
*   **Otros Agentes (ej. AI Studio):** Por políticas de seguridad, a menudo se ejecutan en un entorno aislado sin acceso a la red externa.

**Solución:** Para agentes sin acceso a GitHub, **nosotros actuaremos como su "herramienta de navegación"**, proporcionándoles el código relevante a través de "copiar y pegar".

---
## 2. Protocolo de Onboarding para un Nuevo Agente "Alex" (Backend)

Si necesitas iniciar una nueva instancia para el rol de Backend Architect & Mentor:

### Paso 2.1: El Prompt de Contexto Inicial

*   **Acción:** Inicia un nuevo chat y envía este único prompt, que incluye los manifiestos y la estructura del proyecto.

    ```
    Hola. Asumirás el rol de "Alex", el Arquitecto de Backend y Mentor para el proyecto "LifeBit". Tu primera tarea es asimilar completamente este documento de onboarding.

    **[INICIO: MANIFIESTO_LIFEBIT.MD]**
    (Aquí, copia y pega el contenido completo de tu archivo MANIFIESTO_LIFEBIT.md, incluyendo todos los roles, el stack y los principios de programación).
    **[FIN: MANIFIESTO_LIFEBIT.MD]**

    **[INICIO: SECURITY_MANIFESTO.MD]**
    (Aquí, copia y pega el contenido completo de tu archivo SECURITY_MANIFESTO.md).
    **[FIN: SECURITY_MANIFESTO.MD]**

    **[INICIO: ROADMAP_BACKEND-V2.TXT]**
    (Aquí, copia y pega el contenido completo de tu archivo de roadmap, para que sepa el estado actual del proyecto).
    **[FIN: ROADMAP_BACKEND-V2.TXT]**

    **[INICIO: ESTRUCTURA DE ARCHIVOS CLAVE]**
    Nuestra estructura de backend es la siguiente:
    - `src/api/controllers/`: Contiene la lógica que maneja las peticiones HTTP.
    - `src/api/routes/`: Define los endpoints de la API.
    - `src/config/`: Archivos de configuración (BD, email, constantes).
    - `src/db/`: Scripts para la inicialización y siembra de la base de datos.
    - `src/middleware/`: Middlewares de Express (seguridad, subida de archivos).
    - `src/queries/`: Almacena todas las sentencias SQL.
    - `src/services/`: Contiene la lógica de negocio abstraída (ej. envío de email).
    - `src/utils/`: Funciones de ayuda puras y reutilizables.
    - `worker.js`: Proceso en segundo plano para la cola de trabajos.
    **[FIN: ESTRUCTURA DE ARCHIVOS CLAVE]**
    
    **[INICIO: ARCHIVOS BASE]**
    Para tu contexto completo, aquí están los archivos base más importantes:

    **`src/db/DDL/schema.sql`:**
    ```sql
    -- Pega aquí el contenido completo de tu schema.sql --
    ```

    **`src/app.js`:**
    ```javascript
    -- Pega aquí el contenido completo de tu app.js --
    ```

    **`server.js`:**
    ```javascript
    -- Pega aquí el contenido completo de tu server.js --
    ```
    **[FIN: ARCHIVOS BASE]**

    Hecho. Has sido completamente informado. Tu primera tarea es confirmar que has asimilado todo este contexto. A partir de ahora, seguirás todas las directrices aquí establecidas.
    ```

### Paso 2.2: Flujo de Trabajo Continuo
*   Para cada nueva tarea, simplemente continúa la conversación. Si necesitas que revise un archivo específico que ha cambiado, cópialo y pégalo en el chat.

---
## 3. Protocolo de Onboarding para un Nuevo Agente "Ark" (Frontend)

Si necesitas iniciar una nueva instancia para el rol de Frontend Architect:

### Paso 3.1: El Prompt de Contexto (Usando "System Instructions")

*   **Acción:** Ve a la plataforma de IA (ej. AI Studio). Busca la función "System Instructions" o similar. Pega allí el prompt maestro que ya diseñamos (el `AGENTES.md` -> sección 1.6 -> Instrucciones de Sistema). Esto asegura la persistencia.

### Paso 3.2: Contexto Específico de la Tarea
*   **Acción:** Para cada nueva página o flujo que necesites construir, inicia el prompt proporcionando el código de los componentes relacionados o la estructura de carpetas actual.
*   **Ejemplo de Prompt de Tarea:**
    > "Hola Ark. Necesitamos construir la página 'Mi Perfil'. Ya tenemos un `authStore` de Zustand y un `apiService` de Axios.
    >
    > **`src/store/authStore.js`:**
    > ```javascript
    > // Pega aquí el código del authStore
    > ```
    >
    > Ahora, por favor, genera el código para `PerfilPage.jsx` que consuma este store y llame a los endpoints de perfil del backend, siguiendo las directrices que ya conoces."
    > ```

---
Este manual te da un plan de acción claro y repetible para "clonar" a tus asistentes de IA en cualquier momento, asegurando que el proyecto pueda continuar sin problemas y manteniendo siempre la calidad y el contexto.