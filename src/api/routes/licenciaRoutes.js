const express = require('express');
const { protegeRuta, verificaRol } = require('../../middleware/authMiddleware');
const licenciaController = require('../controllers/licenciaController');

const router = express.Router();

// Middleware global para verificar autenticación y rol
router.use(protegeRuta, verificaRol('dueño_app'));

// CRUD básico
router.route('/')
    .get(licenciaController.obtenerLicencias)
    .post(licenciaController.crearLicencia);

router
	.route('/:id')
	.get(licenciaController.obtenerLicenciaPorId)
	.patch(licenciaController.actualizarLicencia)
	.delete(licenciaController.eliminarLicencia);

module.exports = router;
