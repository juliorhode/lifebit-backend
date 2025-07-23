// Carga las variables de entorno desde .env
require('dotenv').config()
const express = require('express')
// Importamos morgan para el logger
const morgan = require('morgan')

/* Importar Enrutadores */
const solicitudRoutes = require('./api/routes/solicitudRoutes')
const authRoutes = require('./api/routes/authRoutes')
const dueñoRoutes = require('./api/routes/dueñoRoutes')

const app = express()

/**** Middleware para parsear cuerpos de peticion en formato JSON ****/
app.use(express.json())


// Usamos el middleware morgan.
// 'dev' es un formato predefinido que nos da una salida concisa y coloreada
app.use(morgan('dev'))

/****  Enrutadores ****/
// Ruta para el registro de nuevos usuarios
app.use('/api/solicitudes', solicitudRoutes)
// ruta de login
app.use('/api/auth', authRoutes)
// rutas de owner
app.use('/api/owner', dueñoRoutes)

// ruta de prueba de verificacion que el servidor funciona
app.get('/', (req, res) => {
    res.send("API de lifebit funcionando")
})

/**** Importar manejador de errores ****/
const errorHandler = require('./middleware/errorHandler')
// Registramos el manejador de errores
app.use(errorHandler)

module.exports = app

