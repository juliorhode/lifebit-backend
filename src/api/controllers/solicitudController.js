const db = require('../../config/db')
const AppError = require('../../utils/appError')
const archivoQueries = require('../../queries/archivoQueries')
const solicitudQueries = require('../../queries/solicitudQueries')

/**
 * @description Crea una nueva solicitud de servicio.
 * @route POST /api/solicitudes
 * @access Public
 */
const crearSolicitud = async (req, res, next) => {
	// Obtenemos un cliente para ejecutar todas nuestras operaciones en una transacción.
	const cliente = await db.getClient()

	try {
		// Iniciamos la transacción.
		await cliente.query('BEGIN')
		// 1. Procesar los datos de texto del formulario desde req.body.
		const {
			nombre_solicitante,
			apellido_solicitante,
			email_solicitante,
			telefono_solicitante,
			cedula_solicitante,
			nombre_edificio,
			direccion_edificio,
			id_licencia_solicitada,
		} = req.body

		// Validación de campos de texto obligatorios.
		if (
			!nombre_solicitante ||
			!apellido_solicitante||
			!email_solicitante ||
			!nombre_edificio ||
			!id_licencia_solicitada
		) {
			throw new AppError('Los campos nombre, email, nombre del edificio,y licencia son obligatorios',400)
		}

		// 2. Procesar los archivos subidos (si existen).
		// multer nos entrega el objeto 'files' con la información de los archivos guardados.
		let idArchivoCedula = null
		let idDocumentoCondominio = null

		// Verificamos si el archivo de la cédula fue subido.
		if (req.files && req.files.archivo_cedula) {
			const archivoCedula = req.files.archivo_cedula[0]
			const valoresArchivo = [
				archivoCedula.originalname,
				archivoCedula.path, // La ruta donde multer guardó el archivo.
				archivoCedula.mimetype,
				archivoCedula.size,
				null, // id_usuario_subio es null porque el solicitante no es un usuario.
			]
			const resultado = await cliente.query(
				archivoQueries.INSERT_ARCHIVO,
				valoresArchivo
			)
			idArchivoCedula = resultado.rows[0].id
		}

		// Verificamos si el documento del condominio fue subido.
		if (req.files && req.files.documento_condominio) {
			const archivoCondominio = req.files.documento_condominio[0]
			const valoresArchivo = [
				archivoCondominio.originalname,
				archivoCondominio.path, // La ruta donde multer guardó el archivo.
				archivoCondominio.mimetype,
				archivoCondominio.size,
				null, // id_usuario_subio es null porque el solicitante no es un usuario.
			]
			const resultado = await cliente.query(
				archivoQueries.INSERT_ARCHIVO,
				valoresArchivo
			)
			idDocumentoCondominio = resultado.rows[0].id
		}

		// 3. Crear el registro final en 'solicitudes_servicio'.
		const valoresSolicitud = [
			nombre_solicitante,
			apellido_solicitante,
			email_solicitante,
			telefono_solicitante,
			cedula_solicitante,
			idArchivoCedula,
			nombre_edificio,
			direccion_edificio,
			idDocumentoCondominio,
			id_licencia_solicitada,
		]
		const {
			rows: [nuevaSolicitud],
		} = await cliente.query(
			solicitudQueries.INSERT_SOLICITUD,
			valoresSolicitud
		)

        // Si todo salió bien, confirmamos la transacción.
        await cliente.query('COMMIT')
        
        // 4. Enviar la respuesta de éxito.
        res.status(201).json({
            success: true,
            message: 'Su solicitud ha sido procesada exitosamente. Le contactaremos pronto.',
            data: {
                solicitud: nuevaSolicitud
            }
        })
        
    } catch (error) {
		// Si ocurre cualquier error, revertimos todos los cambios de la transacción.
		await cliente.query('ROLLBACK')
		// Pasamos el error a nuestro manejador de errores global.
		// Si el error viene de nuestra validación (new AppError), se mantendrá.
        // Si es un error de la BD, el manejador le asignará un código 500.
        next(error)
    } finally {
        // Liberamos el cliente para devolverlo al pool, pase lo que pase.
        cliente.release()
	}
}

module.exports = {
    crearSolicitud
}
