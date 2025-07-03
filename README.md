# Estructura
lifebit-backend/          // Esta será la carpeta principal que contendrá todo nuestro backend.
├── src/
│   ├── api/
│   │   ├── controllers/  // Lógica de negocio (qué hacer con una petición)
│   │   └── routes/       // Definición de las rutas/endpoints
│   ├── config/           // Configuración (DB, etc.)
│   ├── middleware/       // Middlewares (autenticación, logging, etc.)
│   ├── services/         // Lógica de negocio reutilizable (ej. servicio de notificaciones)
│   └── utils/            // Funciones de ayuda genéricas (ej. formatear fechas)
└── ... (aquí irán package.json, app.js, etc.)

`mkdir -p src/api/controllers src/api/routes src/config src/middleware src/services src/utils`

- src/api: Contendrá todo lo relacionado directamente con nuestra API (rutas y controladores).
- src/api/controllers: Los "cerebros" que contienen la lógica para cada ruta.
- src/api/routes: Los "mapas" que definen las URLs de nuestra API.
- src/config: Archivos de configuración, como la conexión a la base de datos.
- src/middleware: Nuestros "guardias de seguridad" o "ayudantes" que se ejecutan entre la petición y la respuesta.
- src/services: Lógica de negocio más compleja o reutilizable (ej. un "ServicioDeNotificaciones").
- src/utils: Pequeñas funciones de ayuda (utilidades) que podemos usar en todo el proyecto.
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