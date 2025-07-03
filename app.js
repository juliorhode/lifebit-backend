// Carga las variables de entorno desde .env
require('dotenv').config()

const express = require('express')
const app = express()

/* Importar Enrutadores */
const edificiosRoutes = require('./src/api/routes/edificiosRoutes')

/* Middleware para parsear cuerpos de peticion en formato JSON */
app.use(express.json())

/* Enrutadores */
app.use('/api/edificios', edificiosRoutes)

// ruta de prueba de verificacion que el servidor funciona
app.get('/', (req, res) => {
    res.send("API de lifebit funcionando")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor de lifebit corriendo en el puerto: ${PORT}`);
})