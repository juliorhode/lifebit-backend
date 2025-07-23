const express = require('express')
const solicitudController = require('../controllers/solicitudController')
const crearUploadMiddleware = require('../../middleware/uploadMiddleware')

// Creamos una instancia del enrutador
const router = express.Router()
// 1. Llamamos a nuestro middleware de subida de archivos 
// que guardará los archivos específicamente en la carpeta 'uploads/solicitudes'.

const uploadSolicitud = crearUploadMiddleware('solicitudes')

// 2. Definimos la ruta POST en la raíz de este enrutador ('/').
// POST /api/solicitudes
router.post(
	// La sub-ruta.
	'/',
	// 3. Aplicamos el middleware de Multer.
	//    Usamos .fields() para indicar que esperamos archivos de dos campos diferentes.
	//    Estos nombres ('archivo_cedula', 'documento_condominio') deben coincidir
	//    exactamente con los nombres que el frontend usará en el formulario.
	uploadSolicitud.fields([
		{ name: 'archivo_cedula', maxCount: 1 },
		{ name: 'documento_condominio', maxCount: 1 },
	]),
	// 4. Si el middleware de subida tiene éxito, la petición pasa al controlador.
	solicitudController.crearSolicitud
)
// Más adelante, aquí podríamos añadir rutas para que el Dueño gestione las solicitudes.
// ej. router.get('/', protegeRuta, verificaRol('dueño_app'), solicitudController.obtenerSolicitudes);

module.exports = router