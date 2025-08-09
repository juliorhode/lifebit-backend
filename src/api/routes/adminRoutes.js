const express = require('express');
const unidadController = require('../controllers/unidadController');
const recursoController = require('../controllers/recursoController');
const adminController = require('../controllers/adminController');
const xlsxUploadMiddleware = require('../../middleware/xlsxUploadMiddleware');
const { protegeRuta, verificaRol } = require('../../middleware/authMiddleware');
const configController = require('../controllers/configController');

const router = express.Router();

// --- SEGURIDAD A NIVEL DE ROUTER ---
// Aplicamos nuestros middlewares de seguridad a todas las rutas definidas en este archivo.
// Esto garantiza que solo los administradores autenticados puedan acceder a estas funciones.
router.use(protegeRuta, verificaRol('administrador'));

// --- RUTA PARA GESTIONAR EL FLUJO DEL ASISTENTE ---
// POST /api/admin/configuracion/avanzar-paso
router.post('/configuracion/avanzar-paso', configController.avanzarPasoConfiguracion);

// --- Rutas de Gestión de Unidades ---
// Para generar las unidades del edificio
// POST /api/admin/unidades/generar-flexible
router.post('/unidades/generar-flexible', unidadController.generarUnidadesFlexible);
// Para listar todos los apartamentos cargados del edificio
// GET /api/admin/unidades/
router.get('/unidades', unidadController.obtenerUnidades);

// --- RUTAS PARA GESTIONAR LOS *TIPOS* DE RECURSO ---

router
	.route('/recursos/tipos')
	.post(recursoController.crearTipoRecurso) // POST /api/admin/recursos/tipos;
	.get(recursoController.obtenerTiposRecurso); // GET /api/admin/recursos/tipos;

router
	.route('/recursos/tipos/:id')
	.patch(recursoController.actualizarTipoRecurso) // PATCH /api/admin/recursos/tipos/:id
	.delete(recursoController.eliminarTipoRecurso); // DELETE /api/admin/recursos/tipos/:id

// --- Rutas de Instancias de Recurso ---
// POST /api/admin/recursos/generar-secuencial
router.post('/recursos/generar-secuencial', recursoController.generarRecursosSecuencialmente);

// POST /api/admin/recursos/cargar-inventario
// 1. Primero se ejecuta el middleware 'uploadSpreadsheet'.
// 2. Si el archivo es válido, 'uploadSpreadsheet' lo adjunta a 'req.file'.
// 3. Finalmente, se ejecuta el controlador 'cargaInventarioArchivo'.
router.post(
	'/recursos/cargar-inventario',
	xlsxUploadMiddleware,
	recursoController.cargaInventarioArchivo
);
// PATCH /api/admin/recursos/asignaciones
router.patch('/recursos/asignaciones', recursoController.actualizarAsignaciones);
// GET /api/admin/recursos/por-tipo/:idTipo
router.get('/recursos/por-tipo/:idTipo', recursoController.obtenerRecursosPorTipo);

// --- Rutas de Gestión de Residentes ---
// Para invitar a un residente, también se requiere que las unidades ya existan.
// Para invitar a residentes al edificio
// POST /api/admin/residentes/invitar
router.post('/invitaciones/residentes', adminController.invitarResidente);

// POST /api/admin/invitaciones/residentes-masivo
router.post(
	'/invitaciones/residentes-masivo',
	xlsxUploadMiddleware,
	adminController.invitarResidentesMasivo
);

// GET /api/admin/residentes
router.get('/residentes', adminController.obtenerResidentes);

router
	.route('/residentes/:id')
	.patch(adminController.actualizaResidente) // PATCH /api/admin/residentes/:id
	.delete(adminController.eliminarResidente); // DELETE /api/admin/residentes/:id

module.exports = router;
