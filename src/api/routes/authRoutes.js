const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

// Ruta para el registro de nuevos usuarios.
// POST /api/auth/registro
router.post('/registro', authController.register)

module.exports = router
