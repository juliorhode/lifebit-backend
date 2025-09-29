const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protegeRuta, verificaRol } = require('../../middleware/authMiddleware');
const passport = require('passport');

// Ruta para el registro de nuevos usuarios.
// POST /api/auth/registro
router.post('/registro', authController.register);

// ruta de login
// POST /api/auth/login
router.post('/login', authController.login);

// ruta de logout
// POST /api/auth/logout
router.post('/logout', protegeRuta, authController.logout);

// No necesita protección, ya que su "protección" es la validez del propio refreshToken
// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

// Ruta de temporal para ruta protegida
// GET api/auth/perfil
router.get('/perfil', protegeRuta, authController.obtenerPerfil);

// Ruta para activacion de cuenta
// POST /api/auth/finalizar-registro
router.post('/finalizar-registro', authController.finalizarRegistro);

// --- RUTAS DE GESTIÓN DE CONTRASEÑA ---
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/', authController.resetPassword);
// 1. 'protegeRuta' se ejecuta primero. Si el token es válido, adjunta 'req.user' y llama a next().
// 2. 'authController.updateMyPassword' se ejecuta después.
router.patch('/update-password', protegeRuta, authController.updatePassword);

// --- RUTAS DE GOOGLE OAUTH ---
// La ruta inicial que el frontend llamará.
// 'passport.authenticate' inicia el flujo de redirección a Google.
// Le decimos que use la estrategia 'google' y le pedimos los scopes 'profile' y 'email'.

// GET /api/auth/google
router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);

// La ruta de callback a la que Google nos redirigirá.
// Passport intercepta esta petición, maneja el código de Google, y si tiene éxito,
// llama a la función del controlador que le pasamos.

// GET /api/auth/google/callback
router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/login-error' }), // Si falla, redirige a una ruta de error.

	authController.googleCallback
);

module.exports = router;
