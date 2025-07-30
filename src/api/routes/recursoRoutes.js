const express = require('express');
const recursoController = require('../controllers/recursoController');
const { protegeRuta, verificaRol } = require('../../middleware/authMiddleware');

const router = express.Router();

// --- SEGURIDAD A NIVEL DE ROUTER ---
// Aplicamos nuestros middlewares de seguridad a todas las rutas definidas en este archivo.
// Esto garantiza que solo los administradores autenticados puedan acceder a estas funciones.
router.use(protegeRuta, verificaRol('administrador'));

// --- RUTAS PARA GESTIONAR LOS *TIPOS* DE RECURSO ---
router
	.route('/tipos')
	.get(recursoController.obtenerTiposRecurso) // GET /api/admin/recursos/tipos;
	.post(recursoController.crearTipoRecurso); // POST /api/admin/recursos/tipos;

router
	.route('/tipos/:id')
	.patch(recursoController.actualizarTipoRecurso) // PATCH /api/admin/recursos/tipos/:id
	.delete(recursoController.eliminarTipoRecurso); // DELETE /api/admin/recursos/tipos/:id

// GET /api/admin/recursos/tipos
//router.get('/tipos', recursoController.obtenerTiposRecurso);

// POST /api/admin/recursos/tipos
//router.post('/tipos',recursoController.crearTipoRecurso);

// PATCH /api/admin/recursos/tipos/:id
// router.patch('/tipos/:id', recursoController.actualizarTipoRecurso);

// DELETE /api/admin/recursos/tipos/:id
// router.delete('/tipos/:id', recursoController.eliminarTipoRecurso);

// POST /api/admin/recursos/generar-secuencial;

router.post(
	'/generar-secuencial',
	recursoController.generarRecursosSecuencialmente
);

module.exports = router;
