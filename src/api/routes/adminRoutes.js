const express = require('express');
const unidadController = require('../controllers/unidadController');
const { protegeRuta, verificaRol } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware a nivel de router:
// Todas las rutas definidas en este archivo requerirán que el usuario
// esté autenticado (protegeRuta) y tenga el rol 'administrador' (verificaRol).
router.use(protegeRuta, verificaRol('administrador'));

// Para generar las unidades del edificio
// POST /api/admin/unidades/generar-flexible
router.post(
	'/unidades/generar-flexible',
	unidadController.generarUnidadesFlexible
);

// Para listar todos los apartamentos cargados del edificio
// GET /api/admin/unidades/
router.get('/unidades', unidadController.obtenerUnidades)

module.exports = router;
