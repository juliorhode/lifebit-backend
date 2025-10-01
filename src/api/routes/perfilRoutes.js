const express = require('express');
const perfilController = require('../controllers/perfilController');
const { protegeRuta } = require('../../middleware/authMiddleware');
const router = express.Router();

// Todas las rutas definidas a partir de este punto requieren autenticación.
router.use(protegeRuta);

// Ruta de temporal para ruta protegida
// GET /api/perfil/me
router.get('/me', perfilController.obtenerPerfil);

// Más rutas de perfil pueden añadirse aquí, todas protegidas por 'protegeRuta'.

module.exports = router;