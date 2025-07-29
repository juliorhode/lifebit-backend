const format = require('pg-format');
const db = require('../../config/db');
const AppError = require('../../utils/appError');
const unidadQueries = require('../../queries/unidadQueries');

/**
 * @description Genera unidades de forma masiva para un edificio.
 * @route POST /api/admin/unidades/generar-flexible
 * @access Private (administrador)
 */

const generarUnidadesFlexible = async (req, res, next) => {
	try {
		// --- 1. OBTENER Y VALIDAR DATOS ---
		const { patronNombre, alicuotaPorDefecto, configuracionPisos } =
			req.body;
		const idEdificio = req.usuario.id_edificio_actual;
		// Validaciones de entrada
		if (
			!patronNombre ||
			!configuracionPisos ||
			Array.isArray(configuracionPisos) ||
			configuracionPisos.length === 0
		) {
			throw new AppError(
				'El patron de nombre y la configuracion de pisos son obligatorios',
				400
			);
		}
		if (!idEdificio) {
			throw new AppError(
				'El administrador no esta asociado a ningun edificio',
				400
			);
		}
		// --- 2. MOTOR DE GENERACIÓN ---
		const unidadesParaInsertar = [];
		const abecedario = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		// Iteramos sobre la configuración enviada desde el frontend.
		for (const configPiso of configuracionPisos) {
			const { piso, cantidad } = configPiso;
			// Iteramos para crear la cantidad de unidades de cada piso.
			for (let unidad = 1; unidad <= cantidad; unidad++) {
				// Lógica para reemplazar los placeholders
				let nombreUnidad = patronNombre
					.replace(/{P}/g, String(piso).padStart(2, '0'))
					.replace(/{p}/g, piso)
					.replace(/{U}/g, String(unidad).padStart(2, '0'))
					.replace(/{u}/g, unidad)
					.replace(/{L}/g, abecedario[piso - 1] || '') // Letra del piso (A=1, etc.)
					.replace(/{l}/g, abecedario[unidad - 1] || ''); // Letra de la unidad

				/*
                NOTA:
                He usado .replace(/{P}/g, ...) con el flag g (global) para reemplazar todas las ocurrencias del placeholder, no solo la primera.
                He añadido la lógica para las letras {L} y {l} usando un string de abecedario.
                */

				// Cada unidad es un array de valores en el orden de las columnas de la BD.
				unidadesParaInsertar.push([
					idEdificio,
					nombreUnidad,
					alicuotaPorDefecto || 0, // Usamos 0 si no se proporciona.
				]);
			}
		}

		if (unidadesParaInsertar.length > 0) {
			throw new AppError(
				'La configuracion proporcionada no generó ninguna unidad',
				400
			);
		}
		// --- 3. INSERCIÓN MASIVA EN LA BASE DE DATOS ---
		// Usamos pg-format. El primer argumento es la plantilla de la query.
		// El segundo es el array de arrays con nuestros datos.
		// format() convierte esto en una query SQL segura y formateada.
		const sql = format(
			unidadQueries.INSERT_UNIDADES_MASIVO,
			unidadesParaInsertar
		);
		// Ejecutamos la query generada.
		await db.query(sql);
		// --- 4. RESPUESTA EXITOSA ---
		res.status(200).json({
			success: true,
			message: `${unidadesParaInsertar.length} unidades han sido creadas exitosamente para tu edificio.`,
		});
	} catch (error) {
		// Manejamos el error de unicidad (si se intenta generar unidades dos veces).
		if (error.code === '23505') {
			return next(
				new AppError(
					'Una o más unidades generadas ya existen para este edificio.',
					409
				)
			);
		}
		next(error);
	}
};

module.exports = {
	generarUnidadesFlexible,
};
