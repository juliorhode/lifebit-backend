const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const {protegeRuta,verificaRol }  = require('../../middleware/authMiddleware')

// Ruta para el registro de nuevos usuarios.
// POST /api/auth/registro
router.post('/registro', authController.register)

// ruta de login
// POST /api/auth/login
router.post('/login', authController.login)

// No necesita protección, ya que su "protección" es la validez del propio refreshToken
// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken)

// Ruta de temporal para ruta protegida
// GET api/auth/perfil
router.get('/perfil', protegeRuta, authController.obtenerPerfil)

// Ruta para activacion de cuenta
// POST /api/auth/finalizar-registro
router.post('/finalizar-registro', authController.finalizarRegistro);

// --- RUTAS DE GESTIÓN DE CONTRASEÑA ---
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/', authController.resetPassword);
// 1. 'protegeRuta' se ejecuta primero. Si el token es válido, adjunta 'req.user' y llama a next().
// 2. 'authController.updateMyPassword' se ejecuta después.
router.patch('/update-password', protegeRuta, authController.updatePassword);

module.exports = router
