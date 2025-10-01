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

/**
 * @description Punto de entrada para el LOGIN con Google.
 * Para usuarios no autenticados que ya han vinculado su cuenta.
 * @access Public
 */
// GET /api/auth/google
// Para usuarios no autenticados. Inicia un flujo de LOGIN. Su único objetivo es autenticar a un usuario que ya debería tener una cuenta vinculada a Google.
// Desde el botón "Iniciar sesión con Google" en LoginPage.jsx.
router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);

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

/**
 * @description El endpoint de callback al que Google redirige en TODOS los flujos de OAuth.
 * Es el "cerebro" que decide qué hacer según el contexto.
 * @access Public (pero manejado por Passport)
 */
// GET /api/auth/google/callback
// Para nadie directamente. Es la URL a la que Google nos devuelve al usuario.
// La ruta de callback a la que Google nos redirigirá.
// Passport intercepta esta petición, maneja el código de Google, y si tiene éxito,
// llama a la función del controlador que le pasamos.
// Si no hay contexto -> Intenta hacer un login.
// Si hay un token_invitacion en la sesión -> Intenta activar la cuenta.
// Si hay un req.user en la sesión -> Intenta vincular la cuenta.
router.get(
	'/google/callback',
	passport.authenticate('google', {
		failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
	}), // Si falla, redirige a una ruta de error.

	authController.googleCallback
);

module.exports = router;
