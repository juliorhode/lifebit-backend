// Carga las variables de entorno desde .env
require('dotenv').config()
const express = require('express')
// Importamos morgan para el logger
const morgan = require('morgan')

const app = express()

/* Importar Enrutadores */
const authRoutes = require('./api/routes/authRoutes')
const ownerRoutes = require('./api/routes/ownerRoutes')
const licenciaRoutes = require('./api/routes/licenciaRoutes')

/* Middleware para parsear cuerpos de peticion en formato JSON */
app.use(express.json())

// Usamos el middleware morgan.
// 'dev' es un formato predefinido que nos da una salida concisa y coloreada
app.use(morgan('dev'))

/* Enrutadores */
app.use('/api/auth', authRoutes)
app.use('/api/owner', ownerRoutes)
app.use('/api/owner/licencias',licenciaRoutes)

// ruta de prueba de verificacion que el servidor funciona
app.get('/', (req, res) => {
    res.send("API de lifebit funcionando")
})

/* Importar manejador de errores */
const errorHandler = require('./middleware/errorHandler')
// Registramos el manejador de errores
app.use(errorHandler)

module.exports = app

