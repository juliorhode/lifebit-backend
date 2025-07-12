const express = require('express')
const router = express.Router()

const licenciaController = require('../controllers/licenciaController')
const { protegeRuta, verificaRol } = require('../../middleware/authMiddleware')

// Aplicamos seguridad a nivel de router. Todas las rutas en este archivo
// requerirán autenticación y el rol de 'dueño_app'.
// En lugar de añadir los dos middlewares a cada una de las 5 rutas del CRUD, los aplicamos una sola vez al principio del archivo con router.use(). Esto significa que "todas las rutas definidas de aquí en adelante en este archivo deben pasar primero por estos middlewares".
router.use(protegeRuta,verificaRol('dueño_app'))


// POST /api/owner/licencias
router.post('/', licenciaController.crearLicencia)
// GET /api/owner/licencias
router.get('/', licenciaController.obtenerTodasLasLicencias);
// GET /api/owner/licencias/1
router.get('/:id', licenciaController.obtenerLicenciaPorId);
// PATCH /api/owner/licencias/:id
router.patch('/:id', licenciaController.actualizarLicencia);
router.delete('/:id', licenciaController.eliminarLicencia);

module.exports = router