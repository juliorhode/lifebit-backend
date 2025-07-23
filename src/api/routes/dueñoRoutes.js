const express = require('express')
const dueñoController = require('../controllers/dueñoController')
const { protegeRuta, verificaRol } = require('../../middleware/authMiddleware')

const router = express.Router()
// Middleware a nivel de router: se aplica a TODAS las rutas de este archivo.
// Primero, verificamos que el usuario esté autenticado con un token válido.
// Segundo, verificamos que el rol del usuario sea 'dueño_app'.
router.use(protegeRuta, verificaRol('dueño_app'))

// Definimos la ruta para obtener las solicitudes.
// La ruta completa será GET /api/owner/solicitudes
router.get('/solicitudes', dueñoController.obtenerSolicitudesPendientes)

// Aquí añadiremos la ruta para aprobar la solicitud más adelante.
router.post('/solicitudes/:id/aprobar', dueñoController.aprobarSolicitud);

module.exports = router