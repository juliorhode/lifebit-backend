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
## Define la rama principal (branch)
`git branch -M main`
## Conecta tu repositorio local con el de GitHub
`git remote add origin https://github.com/juliorhode/lifebit-backend.git`
## Sube (push) tu código a GitHub por primera vez
`git push -u origin main`