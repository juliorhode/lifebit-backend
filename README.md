# LifeBit - Backend

Backend de la aplicación de gestión de condominios LifeBit, desarrollado con Node.js, Express y PostgreSQL.

## Estructura del Proyecto

La estructura del proyecto está diseñada para ser escalable y mantener una clara separación de responsabilidades.

# Estructura
`tree -I "node_modules"` para excluir la carpeta node_modules
```
├── app.js
├── package.json
├── package-lock.json
├── README.md
└── src
    ├── api
    │   ├── controllers
    │   └── routes
    ├── config
    ├── middleware
    ├── querys
    ├── services
    └── utils
```


- node_modules/ # Dependencias del proyecto (gestionadas por npm, ignoradas por Git)
- src/ # Carpeta principal del código fuente de la aplicación
- api/ # Todo lo relacionado con la API REST
- controllers/ # Lógica de negocio: procesa las peticiones y genera respuestas.
- routes/ # Define las rutas y endpoints de la API, y las conecta con los controladores.
- config/ # Archivos de configuración (ej. conexión a la base de datos).
- middleware/ # Middlewares de Express (ej. autenticación, logging, manejo de errores).
- services/ # Lógica de negocio compleja o reutilizable (ej. ServicioDeNotificaciones).
- utils/ # Funciones de ayuda y utilidades genéricas.
- .env # Archivo de variables de entorno (ignorado por Git, contiene secretos).
- .gitignore # Especifica los archivos y carpetas que Git debe ignorar.
- app.js # Punto de entrada principal de la aplicación Express.
- package.json # Define el proyecto, sus dependencias y scripts.
- package-lock.json # Registra las versiones exactas de las dependencias.

`mkdir -p src/api/controllers src/api/routes src/config src/middleware src/services src/utils`

- La bandera -p en mkdir -p significa "parents". Se asegura de crear las carpetas padre si no existen (en este caso, creará src/api antes de crear controllers y routes dentro de ella).

# Modulos
`npm install express pg dotenv`

- express: Nuestro framework para el servidor web.
- pg: El driver para conectar con PostgreSQL.
- dotenv: Para manejar nuestras variables de entorno.
## Para desarrollo
`npm install -D nodemon eslint prettier`

- -D es el atajo para --save-dev.
- nodemon: Para reiniciar el servidor automáticamente.
- eslint y prettier: (Opcional por ahora, pero muy recomendado) Son herramientas para mantener nuestro código limpio y con un formato consistente. Las configuraremos más adelante, pero es bueno tenerlas.

# Git
`sudo apt install git`
## Configurar Identidad en Git
```
// Configura tu nombre de usuario para todos tus proyectos de Git en este ordenador.
git config --global user.name "Tu Nombre Completo"

// Configura tu correo electrónico para todos tus proyectos de Git.
git config --global user.email "tu_correo@example.com"
```
## Inicializa Git en tu carpeta local
```
// 'git init' crea una subcarpeta oculta llamada '.git'.
// Aquí es donde Git guarda toda la magia: las "fotografías", el historial, etc.
// Esto convierte tu carpeta en un repositorio de Git.
git init
```
## Añadir todos los archivos
`git add .`
## Tomar la primera "fotografía" (commit)
`git commit -m "Initial project structure and setup"`

`git commit -m "docs: Add project structure to README"`

La palabra "docs:" al principio del commit es una convención para indicar que el cambio es sobre la documentación.
## Define la rama principal (branch)
`git branch -M main`
## Conecta tu repositorio local con el de GitHub
`git remote add origin https://github.com/juliorhode/lifebit-backend.git`
## Sube (push) tu código a GitHub por primera vez
`git push -u origin main`

## Comando s basicos Git

## Guía Rápida de Comandos de Git

Esta es una guía de referencia para los comandos de Git más comunes que usaremos en este proyecto.

### Configuración Inicial (Solo se hace una vez por máquina)
| Comando                                                 | Descripción                                          |
| :------------------------------------------------------ | :--------------------------------------------------- |
| `git config --global user.name "Tu Nombre"`             | Establece el nombre de autor para todos tus commits. |
| `git config --global user.email "tu_email@example.com"` | Establece el email de autor para todos tus commits.  |

### Crear y Clonar Repositorios
| Comando                           | Descripción                                                               |
| :-------------------------------- | :------------------------------------------------------------------------ |
| `git init`                        | **Inicializa** un repositorio de Git en la carpeta actual.                |
| `git clone <url_del_repositorio>` | **Clona** (descarga) un repositorio existente desde una URL (ej. GitHub). |

### El Flujo de Trabajo Básico (El ciclo diario)
| Comando                               | Descripción                                                                                                                                      |
| :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status`                          | Muestra el **estado** de tus archivos: cuáles están modificados, cuáles están en el área de preparación (staging), etc. **El comando más útil.** |
| `git add <archivo>`                   | **Añade** un archivo específico al área de preparación (staging), preparándolo para el próximo commit.                                           |
| `git add .`                           | **Añade todos** los archivos modificados y nuevos al área de preparación.                                                                        |
| `git commit -m "Mensaje descriptivo"` | **Confirma** (guarda) los cambios del área de preparación en el historial del repositorio con un mensaje. Es como tomar una "fotografía".        |
| `git push`                            | **Sube** tus commits confirmados desde tu repositorio local al repositorio remoto (ej. GitHub).                                                  |
| `git pull`                            | **Descarga** los cambios más recientes del repositorio remoto y los fusiona con tu repositorio local.                                            |

### Ramas (Branches) - Para trabajar en nuevas características
| Comando                               | Descripción                                                                                     |
| :------------------------------------ | :---------------------------------------------------------------------------------------------- |
| `git branch`                          | Muestra un **listado** de todas las ramas locales.                                              |
| `git branch <nombre_de_la_rama>`      | **Crea** una nueva rama.                                                                        |
| `git checkout <nombre_de_la_rama>`    | **Cambia** a la rama especificada para empezar a trabajar en ella.                              |
| `git checkout -b <nombre_de_la_rama>` | **Crea y cambia** a la nueva rama en un solo paso. (¡Muy común!)                                |
| `git merge <nombre_de_la_rama>`       | **Fusiona** los cambios de la rama especificada en la rama en la que te encuentras actualmente. |
| `git branch -d <nombre_de_la_rama>`   | **Elimina** una rama local (solo si ya ha sido fusionada).                                      |

### Inspeccionar el Historial
| Comando                                | Descripción                                                                                        |
| :------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `git log`                              | Muestra el **historial de commits** de la rama actual, del más reciente al más antiguo.            |
| `git log --oneline --graph --decorate` | Muestra un historial más **compacto y visual**, con las ramas y etiquetas.                         |
| `git diff`                             | Muestra las **diferencias** entre tus archivos de trabajo y el último commit.                      |
| `git diff --staged`                    | Muestra las diferencias entre los archivos en el área de preparación (staging) y el último commit. |

### Deshacer Cambios
| Comando                     | Descripción                                                                                                                                                           |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git checkout -- <archivo>` | **Descarta** los cambios en un archivo que aún no has añadido al staging (`git add`), volviendo a la versión del último commit. **¡CUIDADO, los cambios se pierden!** |
| `git reset HEAD <archivo>`  | **Saca** un archivo del área de preparación (staging), pero mantiene los cambios en tus archivos de trabajo. Es lo contrario de `git add`.                            |
| `git commit --amend`        | Te permite **modificar** el último commit (ej. para cambiar el mensaje o añadir un archivo que olvidaste).                                                            |

## La Convención de "Conventional Commits"
Es un conjunto de reglas sencillas sobre cómo escribir tus mensajes de commit. Propone una estructura simple para cada mensaje.

- Claridad Absoluta: De un solo vistazo al historial, cualquiera puede entender la naturaleza de cada cambio sin tener que leer el código. ¿Fue una nueva característica? ¿Un arreglo? ¿Un cambio en la documentación?
- Automatización: Herramientas automáticas pueden leer este historial para, por ejemplo, generar un CHANGELOG (un registro de cambios) automáticamente o para determinar cómo incrementar el número de versión de tu software (ej. un fix incrementa la versión de parche, un feat incrementa la versión menor).
- Facilita la Revisión: Cuando trabajas en equipo, ayuda a tus compañeros a entender rápidamente qué hace cada conjunto de cambios.

## Convención para Mensajes de Commit (Conventional Commits)

Para mantener un historial de cambios limpio y legible, seguimos la especificación de "Conventional Commits". Cada mensaje de commit debe empezar con un tipo, seguido de una descripción concisa.

| Tipo de Commit | Propósito                                                                                                                                                            | Ejemplo de Mensaje                                           |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **`feat`**     | **(Feature)** Para cuando añades una **nueva característica** funcional.                                                                                             | `feat: Implementar login con Google`                         |
| **`fix`**      | **(Bug Fix)** Para cuando **arreglas un error** (un bug) en el código.                                                                                               | `fix: Corregir error de cálculo en la generación de recibos` |
| **`docs`**     | **(Documentation)** Para cambios que solo afectan a la **documentación** (ej. `README.md`, comentarios en el código).                                                | `docs: Añadir guía de comandos de Git al README`             |
| **`style`**    | **(Styling)** Para cambios que no afectan la lógica, solo el **formato del código** (espacios, punto y coma, etc.). Usualmente hecho por herramientas como Prettier. | `style: Formatear el código del controlador de usuarios`     |
| **`refactor`** | **(Refactoring)** Para cambios en el código que **ni arreglan un bug ni añaden una característica**, sino que mejoran la estructura o el rendimiento.                | `refactor: Extraer lógica de base de datos a un servicio`    |
| **`test`**     | **(Testing)** Para cuando **añades o corriges pruebas** unitarias o de integración.                                                                                  | `test: Añadir pruebas para el modelo de usuarios`            |
| **`chore`**    | **(Chore / Tareas)** Para cambios en el proceso de construcción, configuración o herramientas auxiliares que **no afectan al código fuente de producción**.          | `chore: Instalar y configurar dotenv`                        |
| **`build`**    | Cambios que afectan el **sistema de construcción** o dependencias externas (ej. `package.json`).                                                                     | `build: Actualizar Express a la última versión`              |
| **`ci`**       | **(Continuous Integration)** Cambios en los archivos y scripts de **integración continua** (ej. configuración de GitHub Actions).                                    | `ci: Configurar el workflow de despliegue a AWS`             |
| **`revert`**   | Si un commit **revierte** un commit anterior. El mensaje suele ser autogenerado por `git revert`.                                                                    | `revert: feat: Implementar login con Google`                 |

---
**Ámbito Opcional:**

A veces, es útil especificar en qué parte del proyecto ocurrió el cambio. Esto se pone entre paréntesis después del tipo.

*   `feat(auth): Añadir endpoint para refrescar token`
*   `fix(pagos): Resolver problema con la conciliación de Banco Mercantil`
*   `docs(reglas): Explicar cómo funciona el simulador`

# Filtrado de Recursos mediante Query Parameters
Son pares de clave-valor que se añaden al final de una URL después de un signo de interrogación (?). Se usan para pasar datos opcionales a una petición GET, como filtros, opciones de ordenación o paginación.

Ejemplo de URL: http://localhost:3001/api/edificios?nombre=Sol&moneda=USD

- ? : Inicia la sección de query parameters.
- nombre=Sol : Primer parámetro. La clave es nombre, el valor es Sol.
- & : Separa los diferentes parámetros.
- moneda=USD : Segundo parámetro.

# Guía de Códigos de Estado HTTP
### Respuestas Exitosas (Rango 2xx)
| Código               | Nombre     | ¿Cuándo se usa?                                                                                                                                | Ejemplo de Uso en LifeBit                            |
| :------------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| **`200 OK`**         | OK         | La respuesta estándar para peticiones `GET` exitosas. También se usa para `PATCH` o `PUT` exitosos si se devuelve el recurso actualizado.      | `GET /api/edificios` devuelve la lista de edificios. |
| **`201 Created`**    | Created    | Se devuelve después de que una petición `POST` ha creado un nuevo recurso con éxito. La respuesta suele incluir el nuevo recurso en el cuerpo. | `POST /api/edificios` crea un nuevo edificio.        |
| **`204 No Content`** | No Content | Se devuelve después de una operación exitosa que no necesita devolver ningún cuerpo de respuesta, típicamente para una petición `DELETE`.      | `DELETE /api/edificios/1` borra un edificio.         |

### Errores del Cliente (Rango 4xx)
Estos errores indican que el cliente ha hecho algo mal (ej. enviar datos incorrectos, pedir un recurso que no existe, no tener permisos).

| Código                 | Nombre       | ¿Cuándo se usa?                                                                                                                          | Ejemplo de Uso en LifeBit                                                                                   |
| :--------------------- | :----------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **`400 Bad Request`**  | Bad Request  | El servidor no puede procesar la petición debido a un error del cliente (ej. datos faltantes, formato JSON malformado).                  | Un `POST` a `/api/edificios` sin el campo `nombre`.                                                         |
| **`401 Unauthorized`** | Unauthorized | El cliente debe autenticarse para obtener la respuesta solicitada. **Nota:** El nombre es confuso; realmente significa "No Autenticado". | Intentar acceder a un dashboard sin haber iniciado sesión.                                                  |
| **`403 Forbidden`**    | Forbidden    | El cliente está autenticado (ha iniciado sesión), pero **no tiene los permisos** necesarios para acceder a ese recurso específico.       | Un "Residente" intenta acceder a una ruta de "Administrador".                                               |
| **`404 Not Found`**    | Not Found    | El servidor no pudo encontrar el recurso solicitado en la URL. Es el error más común.                                                    | Hacer un `GET` a `/api/edificios/999` cuando el ID 999 no existe.                                           |
| **`409 Conflict`**     | Conflict     | La petición no se pudo completar debido a un conflicto con el estado actual del recurso.                                                 | Intentar crear un usuario con un email que ya existe en la base de datos (violando un constraint `UNIQUE`). |

### Errores del Servidor (Rango 5xx)
Estos errores indican que algo salió mal en **nuestro lado (el servidor)**. El cliente hizo una petición válida, pero no pudimos procesarla.

| Código                          | Nombre                | ¿Cuándo se usa?                                                                                                                                  | Ejemplo de Uso en LifeBit                                                                       |
| :------------------------------ | :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **`500 Internal Server Error`** | Internal Server Error | Un error genérico que indica una condición inesperada en el servidor que le impidió cumplir con la petición. Es nuestro "catch-all" por defecto. | Una consulta a la base de datos falla por una razón inesperada, o hay un bug en nuestro código. |

# Logging de Peticiones
Es un middleware que se sitúa muy al principio de la cadena de procesamiento de Express y cuya única función es imprimir en la consola información sobre la petición entrante: el método HTTP (GET, POST), la URL solicitada, el código de estado de la respuesta, el tiempo que tardó en responder, etc.

- Depuración: Cuando estés probando tu API con Postman o el frontend, verás en tiempo real en tu terminal exactamente qué peticiones están llegando. Si una ruta no funciona, lo primero es ver si el servidor la está recibiendo correctamente.
- Monitoreo: En producción, estos logs se pueden enviar a archivos o a servicios de monitoreo para analizar el tráfico, detectar errores y ver qué endpoints son los más utilizados.
- Visibilidad: Te da una "conciencia" de lo que está sucediendo en tu servidor en todo momento.

PAra esto utilizaremos morgan. morgan es un logger de peticiones HTTP creado por el mismo equipo de Express. Este se debe colocar muy arriba en la lista de middlewares en app.js, generalmente justo después de express.json(). Queremos que registre la petición tan pronto como sea posible.

## Instalacion

`npm install morgan`

## Desglose del Log

- GET: El método HTTP.
- /api/edificios: La ruta solicitada.
- 200: El código de estado de la respuesta. 
- 404: para la petición que falló.
- 25.844 ms: El tiempo que tardó el servidor en procesar y responder.
- 345: El tamaño de la respuesta en bytes.

# Manejador de Errores Global
Es un tipo especial de middleware en Express que tiene cuatro argumentos en lugar de los tres habituales: (`error`, `peticion`, `respuesta`, `next`). 

El primer argumento extra, `error`, es la clave. Express es lo suficientemente inteligente como para que si una ruta o un middleware anterior llama a `next()` pasándole un argumento (ej. `next(miError)`), saltará todos los demás middlewares normales y irá directamente a este manejador de errores especial.

## POR QUÉ lo necesitamos
- Evitar que el Servidor se Caiga (Crash): Actualmente, si ocurre un error inesperado en una parte de nuestro código que no está envuelta en un try...catch, el proceso de Node.js se detendrá y nuestro servidor se caerá. Un manejador global captura estos errores y mantiene el servidor en funcionamiento.
- Consistencia: Asegura que todas las respuestas de error 500 - Internal Server Error tengan el mismo formato JSON, en lugar de que cada controlador implemente su propio mensaje.
- No Fuga de Información Sensible: Nos da un único lugar para decidir qué información del error se muestra en la consola (para nosotros, los desarrolladores) y qué mensaje genérico y seguro se envía al cliente. Nunca queremos enviar el "stack trace" completo de un error al usuario final.

## DÓNDE se coloca
- La definición del middleware puede ir en nuestra carpeta src/middleware.
- La llamada a app.use() para registrarlo debe ser la última llamada a app.use() en app.js, justo antes de app.listen().

# Hashing Seguro de Contraseñas con bcrypt
## Problema de las Contraseñas en Texto Plano
Es guardar la contraseña de un usuario tal como la escribe. Si un usuario elige la contraseña "mi_clave_123", guardaríamos exactamente ese texto en la columna contraseña de nuestra tabla usuarios.

### POR QUÉ es una catástrofe de seguridad?
- Fuga de Datos: Si un atacante logra acceder a tu base de datos (por un ataque de inyección SQL, una vulnerabilidad en el servidor, etc.), obtendrá la lista completa de emails y contraseñas de todos tus usuarios.
- Reutilización de Contraseñas: La mayoría de las personas, lamentablemente, reutilizan la misma contraseña en múltiples sitios. Una fuga de tu base de datos podría darles a los atacantes acceso a las cuentas de correo, redes sociales o incluso cuentas bancarias de tus usuarios.
- Acceso Interno Indebido: Un administrador de base de datos (o tú mismo) podría ver las contraseñas de todos. Esto es una violación masiva de la privacidad.

## Solución - Hashing Criptográfico
Es un proceso matemático que toma una entrada de cualquier tamaño (la contraseña) y la convierte en una cadena de texto de longitud fija, llamada hash.

- Irreversibilidad: Es computacionalmente inviable tomar un hash y deducir la contraseña original.
- Efecto Avalancha: Un cambio minúsculo en la contraseña (de "pass123" a "Pass123") produce un hash completamente diferente.
  
### QUÉ es bcrypt?
Es una librería y un algoritmo de hashing específicamente diseñado para contraseñas. Es uno de los más respetados, probados y recomendados en la industria.

### CÓMO funciona?
- Hashing: Toma la contraseña del usuario.
- "Salting" (Añadir Sal): Antes de "licuarla", bcrypt le añade una cadena de texto aleatoria y única llamada "sal" (salt).

    #### ¿POR QUÉ? 

        Para prevenir un tipo de ataque llamado "Rainbow Tables". Si dos usuarios tienen la misma contraseña "123456", sin la sal, ambos tendrían el mismo hash. Con la sal, cada uno tendrá un hash completamente diferente, haciendo los ataques de diccionario precalculado inútiles.

- Factor de Coste (Rounds): bcrypt es deliberadamente lento. Realiza el proceso de "licuado" miles de veces. Este "coste" hace que los ataques de fuerza bruta (probar millones de contraseñas por segundo) sean extremadamente lentos e imprácticos.

    ### PARA QUÉ la usaremos?

        - Al registrar un usuario: Tomaremos su contraseña, usaremos bcrypt.hash() para crear el hash, y guardaremos ese hash en la base de datos.
        - Al iniciar sesión: Tomaremos la contraseña que el usuario introduce, usaremos bcrypt.compare() para "hashearla" de nuevo y compararla con el hash que tenemos guardado en la base de datos. Si coinciden, la contraseña es correcta. Nunca "deshasheamos" nada.

## Instalar bcrypt
`npm install bcrypt`

# Análisis de los Secretos JWT

Estas cuatro variables de entorno son los parámetros de configuración para tu sistema de JSON Web Tokens (JWT). Un JWT es como una credencial o un pase de acceso digital que le entregas a un usuario después de que inicia sesión correctamente. Cada vez que ese usuario quiera acceder a una parte protegida de tu API, deberá presentar este "pase" para demostrar quién es.

1. JWT_SECRET

## ¿Qué es? 
Es una cadena de texto larga, aleatoria y secreta que solo tu servidor conoce. Es, literalmente, la "clave secreta" que usas para "firmar" digitalmente cada JWT que emites.

## ¿Cómo funciona? 
Cuando un usuario inicia sesión, tú creas un JWT que contiene información sobre él (como su id de usuario y su rol). Luego, usas el JWT_SECRET para crear una firma criptográfica y la adjuntas al token. Cuando el usuario te envía el token de vuelta, tú usas el mismo JWT_SECRET para verificar que la firma sea válida.

## Analogía: 
Imagina que eres un guardia de seguridad en un evento exclusivo. Emites pases de acceso (JWTs) a los invitados. Para evitar falsificaciones, pones un sello invisible (la firma) en cada pase con una tinta especial (el JWT_SECRET) que solo tú tienes. Cuando alguien llega, usas tu luz ultravioleta (verificación con el JWT_SECRET) para comprobar el sello. Si el sello no está o es incorrecto, sabes que el pase es falso.

## ¿Por qué es crucial? 
Si alguien descubre tu JWT_SECRET, puede crear sus propios tokens válidos. Podría crear un token que diga "soy el Dueño de la Aplicación" y tu servidor lo aceptaría como auténtico, dándole control total sobre tu plataforma. Este es el secreto más importante de tu aplicación.

## JWT_SECRET
### Cómo generar un buen secreto:

Puedes generar la contraseña desde tu terminal, ejecutando este comando (en Linux/macOS):

`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Copia la salida de ese comando y pégala como el valor de JWT_SECRET.

### Ejemplo de un BUEN secreto: 
8f4b2e1a9c6d3b7f2a1c8e5d9f0a7b4c3e2d1f0b9a8c7d6e5f4a3b2c1d0e9f8a

### Ejemplo de un MAL secreto: 
LifeBitSecretKey2023!

## JWT_EXPIRES_IN

### ¿Qué es? 
Define el tiempo de vida del token de acceso principal (el JWT firmado con JWT_SECRET).

### ¿Cómo funciona? 
Es una cadena de texto que describe una duración. La librería que usaremos (jsonwebtoken) entiende formatos como 1h (1 hora), 7d (7 días), 15m (15 minutos), 365d (365 días). Después de este tiempo, el token "expira" y ya no es válido, incluso si la firma es correcta.

### ¿Por qué se usa? 
Por seguridad. Si un token es robado (por ejemplo, de un navegador infectado), el atacante solo tendrá acceso a la cuenta del usuario durante un tiempo limitado. Un tiempo de vida corto (como 15 minutos o 1 hora) reduce la ventana de oportunidad para un atacante.

### ¿Qué debo colocar aquí? 
Para un token de acceso principal, un valor entre 15m y 1h es un estándar de seguridad muy bueno. 1h (una hora) es un buen punto de partida para LifeBit.

## JWT_REFRESH_SECRET

### ¿Qué es? 
Es OTRA clave secreta, completamente diferente de JWT_SECRET. Se usa para firmar un segundo tipo de token, llamado "Refresh Token".

### ¿Para qué sirve? 
Ya que el token de acceso principal dura poco (ej. 1 hora), sería muy molesto para el usuario tener que volver a iniciar sesión cada hora. El "Refresh Token" resuelve este problema.

Flujo:

- Cuando el usuario inicia sesión, le das DOS tokens: el de acceso (corta vida) y el de refresco (larga vida).

- El usuario usa el token de acceso para todas sus peticiones normales.

- Cuando el token de acceso expira, el frontend detecta el error "401 Unauthorized".

- Automáticamente y sin que el usuario se dé cuenta, el frontend envía el "Refresh Token" a un endpoint especial (ej. /api/v1/auth/refresh).

- El backend verifica este "Refresh Token" usando el JWT_REFRESH_SECRET. Si es válido, emite un NUEVO token de acceso (con una nueva vida de 1 hora) y se lo devuelve al frontend.

- El frontend guarda este nuevo token de acceso y reintenta la petición que había fallado. El usuario ni se entera de que todo esto pasó.

### ¿Por qué debe ser un secreto DIFERENTE?
Porque el Refresh Token es mucho más poderoso y tiene una vida más larga. Separar los secretos te permite invalidar todos los tokens de acceso sin afectar los de refresco, y viceversa. Es una capa extra de seguridad.

### ¿Qué debo colocar aquí? 
Exactamente lo mismo que en JWT_SECRET: una cadena larga y aleatoria, generada de la misma manera, pero que sea diferente.

Puedes generar la contraseña desde tu terminal, ejecutando este comando (en Linux/macOS):

`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## JWT_REFRESH_EXPIRES_IN

### ¿Qué es? 
Define el tiempo de vida del "Refresh Token".

### ¿Qué debo colocar aquí? 
Un valor mucho más largo que el del token de acceso. Valores comunes son 7d (7 días), 30d (30 días) o incluso 90d. Esto representa el tiempo máximo que un usuario puede permanecer "logueado" sin tener que volver a introducir su contraseña. Para LifeBit, 7d o 15d es un excelente punto de partida.

| Variable | Propósito | Ejemplo de Valor    |
| ------ | ---- | --------- |
| JWT_SECRET   | Firmar tokens de acceso (corta vida). Clave de alta rotación.   | e3b0c442... (largo y aleatorio)    |
| JWT_EXPIRES_IN  | Cuánto dura un token de acceso.   | 1h |
| JWT_REFRESH_SECRET| Firmar tokens de refresco (larga vida). Clave de bajo uso.| a1b2c3d4... (largo y diferente)|
| JWT_REFRESH_EXPIRES_IN| Cuánto dura un token de refresco.| 7d|

# Middleware de Protección de Rutas
## ¿Qué es? 
Es un middleware que se colocará en las rutas que queremos proteger. 

Su único trabajo será:
- Revisar si la petición viene con un token de acceso.
- Verificar que ese token sea válido (que no haya sido manipulado y que no haya expirado).
- Si el token es válido, extraer la información del usuario (el payload que pusimos dentro) y añadirla al objeto req de la petición.
- Si el token es inválido o no existe, denegar el acceso.
## ¿Por qué es fundamental? 
Es el guardián de la API. Asegura que solo los usuarios autenticados puedan realizar acciones sensibles, como ver sus datos financieros, crear una noticia o votar.

---
**hice la prueba con 30s, a pesar de darle varias veces desde postman a la ruta de perfil, al cabo de 30s expira.... aun asi este haciendo algo me va a expulsar? me refiero, aun teniendo actividad va a expirar? lo pregunto porque los bancos, si estas haciendo algo, se mantiene la sesion, pero si no haces nada, al cabo de un tiempo, te pregunta si vas a seguir, y si no hay respuesta, cierra la sesion**

## la diferencia entre la expiración fija de un token y una sesión con "inactividad" (sliding session).

### Lo que se tiene ahora (Expiración Fija): 
Un accessToken de JWT es como un ticket de cine para una película que empieza a las 8:00 PM y termina a las 10:00 PM. No importa si entraste a las 8:00, a las 8:30 o a las 9:55. A las 10:00 PM en punto, el ticket ya no es válido y te sacan de la sala. Tu token, una vez emitido con una vida de 30 segundos, tiene una "fecha de muerte" grabada en su interior. A los 30 segundos, expira, sin importar cuánta actividad hayas tenido.

Lo que hacen los bancos (Sesión Deslizante o "Sliding Session"): El sistema bancario funciona más como una tarjeta de acceso a un hotel. La tarjeta es válida por 24 horas. Cada vez que la usas para abrir la puerta de tu habitación, el sistema del hotel ve que sigues activo y automáticamente "reinicia el contador" de las 24 horas desde ese momento. Si dejas de usarla por más de 24 horas, la tarjeta se desactiva.

### ¿Por qué nuestro accessToken no se renueva automáticamente con cada petición?

Porque esa es la naturaleza de un JWT sin estado (stateless). El servidor emite el token y luego se "olvida" de él. No guarda un registro de cuándo fue la última vez que lo usaste. Toda la información de validez está contenida dentro del propio token. Esta es una gran ventaja para la escalabilidad (cualquier servidor puede validar el token sin necesidad de consultar una base de datos de sesiones), pero tiene la "desventaja" que acabas de descubrir.

### La Solución: El Rol del refreshToken y la Lógica del Frontend

Aquí es donde entra en juego la brillantez del patrón accessToken + refreshToken que ya hemos implementado. No es el backend el que "mantiene viva la sesión", es el frontend el que se encarga de renovarla de forma proactiva y silenciosa.

Así es como funciona el flujo completo en una aplicación real (como la de un banco):

- Login Inicial: El usuario inicia sesión. El backend le da un accessToken (vida corta, ej. 15 minutos) y un refreshToken (vida larga, ej. 7 días). El frontend guarda ambos de forma segura (por ejemplo, el refreshToken en una cookie HttpOnly).

- Peticiones Normales: El frontend hace peticiones a las rutas protegidas (como /perfil) usando el accessToken en la cabecera Authorization: Bearer .... El backend valida este token y responde.

- El Momento Crítico (El accessToken expira): El frontend hace una petición a /perfil y el backend responde con un error 401 Unauthorized y un mensaje como "Tu sesión ha expirado...".

- La Magia Silenciosa (Lógica del Frontend): Aquí es donde el frontend inteligente entra en acción. En lugar de mostrarle un error al usuario y expulsarlo, hace lo siguiente automáticamente:
  
    - Intercepta la respuesta de error 401.  
    - Pone en pausa la petición original que falló (la de /perfil).  
    - Hace una NUEVA petición a un endpoint especial que crearemos: POST /api/v1/auth/refresh-token. En esta petición, envía el refreshToken que tiene guardado.

- El Rol del Backend (Endpoint de Refresco):
  - El endpoint /refresh-token recibe el refreshToken.
  - Lo verifica usando el SECRETO DE REFRESCO (JWT_REFRESH_SECRET).
  - Si es válido, el backend genera un NUEVO accessToken (con una nueva vida de 15 minutos) y lo devuelve al frontend.

- Cierre del Círculo (Frontend de Nuevo):
  - El frontend recibe el nuevo accessToken y lo guarda, reemplazando al antiguo que expiró.
  - Ahora, reintenta la petición original que había fallado (la de /perfil), pero esta vez con el nuevo accessToken.

- Resultado Final: La petición a /perfil ahora tiene éxito. El usuario recibe los datos de su perfil y nunca se dio cuenta de que todo este baile de renovación de tokens ocurrió en segundo plano. Para él, la sesión simplemente "continuó".

## En resumen:

Tú no vas a ser expulsado mientras tengas actividad, no porque el accessToken se renueve solo, sino porque tu frontend será lo suficientemente inteligente para detectar cuándo está a punto de expirar (o ya expiró) y usar el refreshToken para obtener uno nuevo sin que te des cuenta.

Esta arquitectura desacoplada es extremadamente potente y es el estándar de la industria para aplicaciones web modernas.

## Nuestro Próximo Paso: 

Tenemos que construir ese endpoint POST /api/auth/refresh-token para completar el ciclo de vida de la sesión.

# ADR-001: Modelo de Roles y Afiliaciones para el MVP
## Título: 
Simplificación del Modelo de Roles para la V1.  

## Contexto: 
El sistema final requiere un modelo de muchos-a-muchos donde un usuario puede tener múltiples roles en múltiples edificios a través de una tabla afiliaciones. Implementar este modelo desde el inicio introduce una complejidad significativa en el flujo de login (requiriendo selección de perfil contextual) y ralentiza el desarrollo de funcionalidades clave del MVP.
Decisión: Para la V1, se implementará un modelo simplificado de uno-a-uno. Se añadirán las columnas rol y id_edificio_actual (nombre provisional) directamente a la tabla usuarios. Esto asume que para el MVP, cada usuario tiene un único rol principal y está asociado a un único edificio en un momento dado.

## Consecuencias y Plan de Refactorización (V2):
Deuda Técnica Aceptada: Esta decisión introduce deuda técnica que deberá ser resuelta para implementar la funcionalidad multi-rol.

## Acciones de Refactorización para V2:
### Migración de Datos: 
- Crear un script para migrar los datos de usuarios.rol y usuarios.id_edificio_actual a la tabla afiliaciones.
- Modificar authController.login: Reimplementar el login para que, tras una autenticación exitosa, devuelva una lista de perfiles/afiliaciones disponibles para el usuario.
- Implementar Selección de Perfil (Frontend): El frontend deberá mostrar esta lista y permitir al usuario seleccionar con qué perfil desea iniciar la sesión.
- Modificar JWT payload: El payload del token deberá incluir id_afiliacion para mantener el contexto de la sesión activa.
- Actualizar Middlewares (protegerRuta, verificarRol): Deberán leer el id_afiliacion del token y verificar los permisos basándose en la afiliación activa.
- Eliminar Columnas: Una vez migrado y probado, eliminar las columnas rol y id_edificio_actual de la tabla usuarios.

**Documentación de Código: Todo el código relacionado con esta simplificación será marcado con un comentario específico:  
// ADR-001: Simplificación de Roles V1.**

| Si en el archivo de origen	| Entonces en el archivo de destino |	Ejemplo de uso |
|-|-|-|
| Exportas un objeto con llaves: `module.exports = { funcA, funcB };`|Importas con llaves (desestructuración): `const { funcA, funcB } = require(...)` |Ideal para controladores y servicios, donde un archivo agrupa varias funciones relacionadas. |
|Exportas una única cosa sin llaves: `module.exports = MiClase;` |Importas sin llaves: `const MiClase = require(...)` |Ideal para clases, configuraciones de DB, o un único middleware que vive en su propio archivo. |

# pool.query vs pool.connect
La librería pg nos ofrece dos formas principales de interactuar con el pool de conexiones:

## pool.query(text, params) (El atajo)
### ¿Qué hace? 
Internamente, hace todo el trabajo por ti en una sola llamada:
- Toma un cliente del pool (pool.connect).
- Ejecuta la consulta con ese cliente.
- Libera el cliente de vuelta al pool (client.release).
- Te devuelve el resultado.
## ¿Cuándo se usa? 
Es perfecto para consultas únicas y aisladas. El 90% de tus operaciones de "Leer" (GET) usarán este método. No necesitas preocuparte por liberar la conexión; es automático. Por eso nuestro método db.query lo usa.

## pool.connect() (El método manual para control total)
### ¿Qué hace? 
Te "presta" un cliente (una conexión) del pool. A partir de ese momento, tú eres responsable de esa conexión.
### ¿Cuándo se usa? 
Se usa exclusivamente cuando necesitas ejecutar múltiples consultas seguidas en la misma conexión. El caso de uso número uno para esto es una TRANSACCIÓN DE BASE DE DATOS.
- Para una transacción, necesitas enviar BEGIN 
- Luego una o más consultas INSERT/UPDATE, 
- Finalmente un COMMIT (si todo va bien) o un ROLLBACK (si algo falla). 
- Todas estas órdenes deben ir al mismo cliente para que la base de datos entienda que son parte de la misma transacción.

**La Regla de Oro:**  
Si usas `pool.connect()`, SIEMPRE debes llamar a `client.release()` al final (típicamente en un bloque finally) para devolver la conexión al pool. Si no lo haces, la conexión se quedará "secuestrada" y nunca volverá al pool. Si esto pasa suficientes veces, agotarás todas las conexiones del pool y tu aplicación dejará de responder a peticiones de base de datos.

# Manejo de Archivos con multer
 La especialidad de multer es manejar peticiones que vienen en formato multipart/form-data, que es el formato estándar que usan los navegadores para enviar formularios que contienen archivos.
## Por qué: 
Porque el middleware express.json() no está diseñado para entender el formato multipart/form-data. Sin un especialista como multer, recibiríamos los datos del archivo como un flujo binario incomprensible y tendríamos que escribir código muy complejo para procesarlo.
## Para qué: 
Para que en nuestro controlador, podamos acceder a los datos del formulario de texto de la manera habitual (req.body) y a los archivos subidos a través de un nuevo objeto que multer nos proporciona (req.files o req.file), de una forma simple y organizada.
## Cómo: 
Lo primero es instalarlo. Luego, crearemos un archivo de configuración donde definiremos cómo queremos que multer maneje los archivos. En nuestro caso, le diremos que los procese en memoria (sin guardarlos en el disco temporalmente), ya que nuestra estrategia es el almacenamiento local definitivo.
## Cuándo: 
Lo aplicaremos como un middleware únicamente en la ruta específica que deba aceptar archivos, en este caso, la ruta para crear una nueva solicitud de servicio. No se usa en rutas que solo manejan JSON.
## Instalación de multer
`npm install multer`
## multer.diskStorage
Es un "motor de almacenamiento" que viene con multer. Le instruye a multer para que guarde los archivos directamente en el disco duro de nuestro servidor.  
Le proporcionamos dos funciones:
- destination: Esta función le dice a multer en qué carpeta guardar el archivo. Podemos incluso usar lógica para cambiar la carpeta dependiendo del tipo de archivo.
- filename: Esta función le dice a multer qué nombre darle al archivo. Es crucial cambiar el nombre del archivo para evitar colisiones (dos usuarios subiendo un comprobante.pdf) y para añadirle información útil, como la fecha.

## Manejo de archivos con multer (los más comunes)
- .single('nombreDelCampo'): Para subir un solo archivo.
- .array('nombreDelCampo', maxCantidad): Para subir múltiples archivos bajo el mismo nombre de campo.
- .fields([{ name: 'campo1' }, { name: 'campo2' }]): El que usaremos. Es perfecto para cuando tienes diferentes campos de archivo en el mismo formulario (en nuestro caso, archivo_cedula y documento_condominio).

# Envío de Emails (Nodemailer)
Es una librería para conectarnos a un servidor de correo (en nuestro caso, el de Gmail para desarrollo) y enviar emails programáticamente.

## Instalacion
`npm install nodemailer`

## Nodemailer y Transporters
En Nodemailer, un "transportador" es un objeto que sabe cómo hablar con un servidor de correo específico (como el de Gmail, Outlook, etc.). Lo configuras una sola vez con el método de conexión (el host, el puerto) y las credenciales de autenticación (usuario, contraseña).

# Contraseña de Aplicación en Google
Es una capa de seguridad en la cuenta de Google que requiere verificar la identidad con un segundo método (como un código a tu teléfono) además de tu contraseña. Google solo permite crear Contraseñas de Aplicación a las cuentas que tienen activada la Verificación en Dos Pasos. Es una medida para asegurar que solo el dueño legítimo de la cuenta pueda autorizar a aplicaciones externas.

## Crear la Contraseña de Aplicación
- Ve a la página de tu Cuenta de Google: myaccount.google.com
- En el menú de la izquierda, haz clic en "Seguridad".
- Dentro de la sección "Cómo acceder a Google", ahora que la verificación en dos pasos está activa, debería aparecer una nueva opción llamada "Contraseñas de aplicaciones". Haz clic en ella.
- Google podría pedirte que inicies sesión de nuevo para verificar tu identidad.
- Verás una pantalla que dice "Contraseñas de aplicaciones".
- En el menú desplegable "Seleccionar aplicación", elige "Otra (nombre personalizado)".
- En el cuadro de texto que aparece, escribe un nombre descriptivo que te ayude a recordar para qué es esta contraseña. Por ejemplo: "LifeBit Backend (Desarrollo)".
- Haz clic en el botón "GENERAR".
- ¡Este es el momento clave! Google te mostrará una ventana emergente con un fondo amarillo. Dentro, verás una contraseña de 16 letras, sin espacios.
`![alt text](https://i.stack.imgur.com/b9n2b.png)`
### Acción Inmediata:
- COPIA esta contraseña de 16 letras inmediatamente.
- PÉGALA en tu archivo .env en la variable EMAIL_APP_PASSWORD.
- NO CIERRES LA VENTANA DE GOOGLE AÚN.
- Guardado: Una vez que la hayas copiado y pegado de forma segura, haz clic en "HECHO" en la ventana de Google.
  NOTA: la contraseña la va entregar google de esta forma: xxxx yyyy zzzz wwww
  Hay que eliminiar los espacion y dejarla de esta manera: xxxxyyyyzzzzwwww

# crypto y Separación de Tokens
crypto, es un módulo nativo de Node.js que proporciona herramientas criptográficas. Lo usaremos para generar una secuencia de bytes verdaderamente aleatoria, que es la base de un token seguro.

## Analogía: 
Si Math.random() es como tirar un dado de 6 caras (predecible hasta cierto punto), crypto.randomBytes() es como usar un generador de números aleatorios cuántico. Es impredecible y seguro para propósitos de seguridad.

## ¿Por qué generamos dos versiones del token (plano y hasheado)?
- El token en texto plano (ej. a1b2c3d4...) es el que se envía al usuario en el email. Es como la contraseña de un solo uso.
- El token hasheado (ej. SHA256('a1b2c3d4...')) es el que se guarda en la base de datos, en la columna token_registro. Es como el hash de la contraseña.

Cuando el usuario hace clic en el enlace, nos devuelve el token en texto plano. Nosotros lo hasheamos y buscamos ese hash en la base de datos.

## ¿Por qué es importante? 
Si un atacante lograra acceder a nuestra base de datos, solo vería los hashes de los tokens de registro. No podría usar esos hashes para construir un enlace de invitación válido y secuestrar una cuenta que aún no ha sido activada. Se aplica el mismo principio de seguridad que con las contraseñas.

# El Principio de Responsabilidad Única (SRP)
El "Principio de Responsabilidad Única" (la 'S' en los principios SOLID) establece que un módulo o una clase debe tener una, y solo una, razón para cambiar.

## Archivo jwtUtils.js
### ¿Cuál es su responsabilidad? 
Su única responsabilidad es manejar JSON Web Tokens (JWT).
### ¿Qué son los JWT? 
Son tokens de autenticación y sesión. Son tokens de larga duración (en el caso del refresh token), reutilizables (el access token se usa en cada petición), y contienen información pública (payload). Siguen un estándar específico (RFC 7519).
### ¿Cuándo cambiaría este archivo?
- Si decidimos cambiar la librería jsonwebtoken por otra.
- Si queremos cambiar la forma en que se construye el payload (ej. añadir más campos).
- Si cambia el estándar JWT.
## Archivo tokenUtils.js 
### ¿Cuál es su responsabilidad? 
Su única responsabilidad es manejar tokens opacos de un solo uso.
### ¿Qué son estos tokens? 
Son tokens para procesos transitorios como la verificación de email, la invitación de usuarios o el reseteo de contraseña. Son de corta duración, de un solo uso, y no contienen información pública. Son simplemente una cadena de caracteres aleatoria y segura.
### ¿Cuándo cambiaría este archivo?
- Si decidimos cambiar el algoritmo de generación de aleatoriedad (ej. de crypto.randomBytes a otra cosa).
- Si decidimos cambiar el algoritmo de hash (ej. de SHA256 a SHA512).
## La Diferencia Fundamental:
Aunque ambos se llaman "tokens", sirven a propósitos fundamentalmente diferentes y tienen ciclos de vida y propiedades de seguridad completamente distintos.  

- JWT -> Sesión de Usuario (¿Quién eres y qué puedes hacer ahora?)  
- Token Opaco -> Verificación de Acción (¿Tienes permiso para realizar esta acción única e irrepetible?)

# pg-format
Es una pequeña pero muy poderosa librería que nos ayuda a formatear consultas SQL de forma segura, especialmente cuando necesitamos insertar múltiples filas de datos a la vez.

## ¿Por qué?
Construir a mano una consulta INSERT con cientos de valores (ej. VALUES ($1, $2), ($3, $4), ...) es tedioso y muy propenso a errores. Más importante aún, es un riesgo de seguridad si no se "escapan" los valores correctamente. pg-format automatiza este proceso de forma segura.

### Analogía: 
Imagina que tienes que enviar 100 invitaciones personalizadas. En lugar de escribir cada una a mano (riesgo de errores), usas una plantilla de "combinar correspondencia" en un procesador de texto. Le das la plantilla (INSERT INTO unidades...) y la lista de invitados en una hoja de cálculo (nuestro array de unidades), y la herramienta (pg-format) genera las 100 invitaciones perfectamente formateadas y sin errores.

## Instalación
`npm install pg-format`

# Placeholders Disponibles para la creacion de unidades:
## Para el Número de Piso:
{p} : Número simple. Ejemplo: 1, 2, ..., 19
{P} : Número con 2 dígitos (con cero a la izquierda). Ejemplo: 01, 02, ..., 19
{L} : Letra del alfabeto (A=1, B=2...). Ejemplo: A, B, ..., S
## Para el Número de Apartamento (por piso):
{u} : Número simple. Ejemplo: 1, 2, 3
{U} : Número con 2 dígitos (con cero a la izquierda). Ejemplo: 01, 02, 03
{l} : Letra del alfabeto (a=1, b=2...). Ejemplo: a, b, c





















# Nota para puebas
Para probar un odulo en el cual no se haya especificado internamente la carga de `require('dotenv').config(...) `, lo podemos hacer indicandole a NodeJs con un flag `-r` o `--require` de la siguiente forma:

Ejemplo con mailer.js:

`node -r dotenv/config src/config/mailer.js `

`-r dotenv/config`: Le dice a Node: "Oye, antes de que ejecutes cualquier cosa, primero carga y ejecuta el script config de la librería dotenv". Este script está diseñado específicamente para leer tu archivo .env de la raíz del proyecto y poblar process.env.

# NodeJs y NVM
nvm permite instalar, desinstalar y cambiar entre diferentes versiones de Node.js con un simple comando, y se encarga de configurar todos los permisos y rutas correctamente.

Vamos a instalar nvm y usarlo para gestionar Node. Esto resolverá el problema de raíz.

Paso 1: Instalar nvm
  Abre una nueva terminal y ejecuta uno de los siguientes comandos. curl es más común, pero si no lo tienes, wget también funciona.

Usando curl:

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`

O usando wget:

`wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`

Paso 2: Activar nvm
  Cierra tu terminal actual y abre una nueva. Esto es importante para que los cambios que hizo el instalador se carguen.

Verifica que se instaló correctamente ejecutando:

`command -v nvm`

Si el comando devuelve nvm, ¡perfecto! Si no, puede que necesites ejecutar source ~/.bashrc o source ~/.zshrc (dependiendo de tu shell).

Paso 3: Instalar y Usar una Versión Estable de Node.js
  Ahora, con nvm, vamos a instalar la versión LTS (Long-Term Support) de Node, que es la más estable para producción y desarrollo.

`nvm install --lts`

Una vez que termine, le diremos a nvm que use esa versión:

`nvm use --lts`

Verifica que ahora tu sistema está usando la versión de Node gestionada por nvm:

`node -v`
`npm -v`
