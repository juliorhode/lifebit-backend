const express = require('express')
const router = express.Router()

/* Controlador */
const edificioController = require('../controllers/edificiosController')

/* Rutas */

// CREATE: Crear un nuevo edificio
// POST /api/edificios/
router.post('/', edificioController.createEdificio)

// READ: Obtener todos los edificios
// GET /api/edificios/
router.get('/', edificioController.getAllEdificios)

// READ: Obtener un solo edificio por su ID
// GET /api/edificios/:id
router.get('/:id', edificioController.getEdificioById)

// UPDATE: Actualizar un edificio existente por su ID
// PATCH /api/edificios/:id
router.patch('/:id', edificioController.updateEdificio)

// DELETE: Eliminar un edificio por su ID
// DELETE /api/edificios/:id
router.delete('/:id', edificioController.deleteEdificio)

/* Exportamos el Router */
module.exports = router
