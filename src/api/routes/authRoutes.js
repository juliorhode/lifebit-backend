const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const protegeRuta  = require('../../middleware/authMiddleware')

// Ruta para el registro de nuevos usuarios.
// POST /api/auth/registro
router.post('/registro', authController.register)

// ruta de login
// POST /api/auth/login
router.post('/login', authController.login)

// No necesita protección, ya que su "protección" es la validez del propio refreshToken
router.post('/refresh-token', authController.refreshToken)

// Ruta de temporal para ruta protegida
// GET api/auth/perfil
router.get('/perfil',protegeRuta,authController.obtenerPerfil)
module.exports = router
