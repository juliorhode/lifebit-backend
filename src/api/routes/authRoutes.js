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


// --- RUTAS FUTURAS ---
// router.post('/finalizar-registro', authController.finalizarRegistro);
// router.post('/forgot-password', authController.forgotPassword);
// router.patch('/reset-password/:token', authController.resetPassword);
// router.patch('/update-my-password', protegeRuta, authController.updateMyPassword);

module.exports = router
