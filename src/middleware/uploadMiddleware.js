// src/middleware/uploadMiddleware.js

const multer = require('multer')
const path = require('path')
const fs = require('fs') // Importamos fs para crear directorios
const AppError = require('../utils/appError')

/**
 * @description Fábrica para crear middlewares de subida de archivos con Multer.
 * @param {string} subdirectorio - El nombre de la subcarpeta dentro de 'uploads' donde se guardarán los archivos.
 * @returns Un middleware de Multer configurado.
 */
const crearUploadMiddleware = (subdirectorio) => {
	// 1. Configuración del almacenamiento en disco
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			// Construimos la ruta base a la carpeta 'uploads'
			const uploadsDir = path.join(__dirname, '../../uploads')
			// Construimos la ruta completa a la subcarpeta específica (ej. 'uploads/solicitudes')
			const destinoFinal = path.join(uploadsDir, subdirectorio)

			// Verificamos si la carpeta de destino existe, si no, la creamos.
			// { recursive: true } asegura que se creen todas las carpetas necesarias en la ruta.
			fs.mkdirSync(destinoFinal, { recursive: true })

			// Le indicamos a multer que este es el destino correcto.
			cb(null, destinoFinal)
		},
		filename: (req, file, cb) => {
			// Creamos un nombre de archivo único para evitar colisiones.
			const uniqueSuffix =
				Date.now() + '-' + Math.round(Math.random() * 1e9)
			const extension = path.extname(file.originalname)
			const finalFilename = `${file.fieldname}-${uniqueSuffix}${extension}`
			cb(null, finalFilename)
		},
	})

	// 2. Filtro de archivos
	const fileFilter = (req, file, cb) => {
		// Aceptamos los tipos de archivo más comunes para documentos e imágenes.
		const tiposPermitidos = /jpeg|jpg|png|gif|pdf/
		// Verificamos tanto la extensión del archivo como su mimetype.
		const extensionValida = tiposPermitidos.test(
			path.extname(file.originalname).toLowerCase()
		)
		const mimetypeValido = tiposPermitidos.test(file.mimetype)

		if (extensionValida && mimetypeValido) {
			cb(null, true)
		} else {
			cb(
				new AppError(
					'Tipo de archivo no permitido. Solo se aceptan imágenes y PDFs.',
					400
				),
				false
			)
		}
	}

	// 3. Devolvemos la instancia de Multer configurada.
	return multer({
		storage: storage,
		fileFilter: fileFilter,
		limits: {
			fileSize: 1024 * 1024 * 5, // Límite general de 5 MB
		},
	})
}

/**
 * Como usarlo:
 * Ejemplo para Solicitudes:
 * Creamos una instancia de upload que guarda en 'uploads/solicitudes'
 * const uploadSolicitud = crearUploadMiddleware('solicitudes'); 
 * router.post('/', uploadSolicitud.fields([...]), ...);
 * 
 * Ejemplo para Avatares:
 * Creamos OTRA instancia que guarda en 'uploads/avatars'
 * const uploadAvatar = crearUploadMiddleware('avatars'); 
 * router.patch('/avatar', uploadAvatar.single('avatar'), ...);
 */

// Exportamos una instancia de multer.
module.exports = crearUploadMiddleware
