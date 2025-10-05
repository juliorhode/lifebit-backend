const express = require('express');
const perfilController = require('../controllers/perfilController');
const { protegeRuta } = require('../../middleware/authMiddleware');
const passport = require('passport');
const router = express.Router();

// Todas las rutas definidas a partir de este punto requieren autenticación.
router.use(protegeRuta);

/**
 * @route   GET /api/perfil/me
 * @desc    Obtiene el perfil completo del usuario actualmente autenticado.
 * @access  Private
 */
router.get('/me', perfilController.obtenerPerfil);

/**
 * @route   PATCH /api/perfil/me
 * @desc    Actualiza los datos personales (nombre, teléfono) del usuario autenticado.
 * @access  Private
 */
router.patch('/me', perfilController.actualizarPerfil);

/**
 * @route   POST /api/perfil/google/desvincular
 * @desc    Desvincula la cuenta de Google del usuario, si tiene una contraseña establecida.
 * @access  Private
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