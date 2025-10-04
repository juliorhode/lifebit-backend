const express = require('express');
const perfilController = require('../controllers/perfilController');
const { protegeRuta } = require('../../middleware/authMiddleware');
const passport = require('passport');
const router = express.Router();

// Todas las rutas definidas a partir de este punto requieren autenticación.
router.use(protegeRuta);

// Ruta de temporal para ruta protegida
// GET /api/perfil/me
router.get('/me', perfilController.obtenerPerfil);

/**
 * @description Punto de entrada para VINCULAR una cuenta de Google.
 * Para usuarios ya logueados (con contraseña) que quieren añadir Google como método de login.
 * @access Private
 */
// GET /api/auth/google/vincular
// Para usuarios invitados y para usuarios activos que quieren conectar su cuenta.
// Desde el botón "Vincular con Google" en ProfilePage.jsx y desde el botón "Vincular con Google" en FinalizarRegistroPage.jsx. El frontend añadirá ?token_invitacion=xxx a la URL si el usuario es invitado.
// Para VINCULAR una cuenta activa. Debe estar protegida.
// Passport es lo suficientemente inteligente como para mantener la sesión req.user existente a través de la redirección.
// Para la activación, lleva el token_invitacion (que guardamos en la sesión). Para la viculacion, lleva la sesión del usuario autenticado.
router.get('/google/vincular', protegeRuta, passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

router.post('/google/desvincular', perfilController.desvinculaGoogle);

module.exports = router;