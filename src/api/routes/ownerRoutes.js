const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
// Importamos el protector de rutas de autenticación
const { protegeRuta, verificaRol } = require('../../middleware/authMiddleware')
// Definimos una ruta y le aplicamos los middlewares en cadena.
// La petición primero debe pasar por 'protegerRuta'. Si tiene éxito, pasa a 'verificarRol'.
// Si ambos tienen éxito, finalmente llega a 'dueñoController.obtenerDashboard'.
// Nota cómo pasamos el argumento 'dueño_app' a verificarRol.
router.get(
	'/dashboard',
	protegeRuta,
	verificaRol('dueño_app'),
	ownerController.getDashboard
)

module.exports = router;