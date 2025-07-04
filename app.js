// Carga las variables de entorno desde .env
require('dotenv').config()

const express = require('express')

// Importamos morgan para el logger
const morgan = require('morgan')


const app = express()

/* Importar manejador de errores */
const errorHandler = require('./src/middleware/errorHandler')

/* Importar Enrutadores */
const edificiosRoutes = require('./src/api/routes/edificiosRoutes')
const authRoutes = require('./src/api/routes/authRoutes')

/* Middleware para parsear cuerpos de peticion en formato JSON */
app.use(express.json())

// Usamos el middleware morgan.
// 'dev' es un formato predefinido que nos da una salida concisa y coloreada
app.use(morgan('dev'))

/* Enrutadores */
app.use('/api/edificios', edificiosRoutes)
app.use('/api/auth',authRoutes)

// ruta de prueba de verificacion que el servidor funciona
app.get('/', (req, res) => {
    res.send("API de lifebit funcionando")
})

// Registramos el manejador de errores
app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor de lifebit corriendo en el puerto: ${PORT}`);
})