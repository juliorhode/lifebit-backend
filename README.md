# LifeBit - Backend

Backend de la aplicación de gestión de condominios LifeBit, desarrollado con Node.js, Express y PostgreSQL.

## Estructura del Proyecto

La estructura del proyecto está diseñada para ser escalable y mantener una clara separación de responsabilidades.

# Estructura
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
    │   └── db.js
    ├── middleware
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