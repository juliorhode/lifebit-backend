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
		const {
			patronNombre,
			alicuotaPorDefecto,
			configuracionGeneral,
			excepciones,
		} = req.body;
		const idEdificio = req.user.id_edificio_actual;

		if (
			!patronNombre ||
			!configuracionGeneral ||
			!configuracionGeneral.totalPisos ||
			configuracionGeneral.unidadesPorDefecto === undefined
		) {
			throw new AppError(
				'El patrón de nombre y la configuración general (totalPisos, unidadesPorDefecto) son obligatorios.',
				400
			);
		}
		if (!idEdificio) {
			throw new AppError(
				'El administrador no está asociado a ningún edificio.',
				400
			);
		}

		// --- 2. MOTOR DE GENERACIÓN INTELIGENTE ---
		const unidadesParaInsertar = [];
		const abecedario = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const mapaExcepciones = {};

		if (excepciones && Array.isArray(excepciones)) {
			for (const excepcion of excepciones) {
				mapaExcepciones[excepcion.piso] = excepcion.cantidad;
			}
		}

		for (let piso = 1; piso <= configuracionGeneral.totalPisos; piso++) {
			const cantidadParaEstePiso =
				mapaExcepciones[piso] !== undefined
					? mapaExcepciones[piso]
					: configuracionGeneral.unidadesPorDefecto;

			// Declaramos la letra del piso DENTRO del bucle de pisos.
			const letraPiso = abecedario[piso - 1] || '';

			for (let unidad = 1; unidad <= cantidadParaEstePiso; unidad++) {
				// Declaramos la letra de la unidad DENTRO del bucle de unidades.
				const letraUnidad = abecedario[unidad - 1] || '';

				let nombreUnidad = patronNombre
					// Placeholders de PISO
					.replace(/{P}/g, String(piso).padStart(2, '0'))
					.replace(/{p}/g, piso)
					.replace(/{L}/g, letraPiso)
					.replace(/{l_p}/g, letraPiso.toLowerCase())
					// Placeholders de UNIDAD
					.replace(/{U}/g, String(unidad).padStart(2, '0'))
					.replace(/{u}/g, unidad)
					.replace(/{L_u}/g, letraUnidad)
					.replace(/{l}/g, letraUnidad.toLowerCase());

				unidadesParaInsertar.push([
					idEdificio,
					nombreUnidad,
					alicuotaPorDefecto || 0,
				]);
			}
		}
		console.log('--- GENERACIÓN FINALIZADA ---');
		// --- VERIFICACIÓN DE UNICIDAD ---
		// Creamos un array que solo contiene los nombres generados.
		const nombresGenerados = unidadesParaInsertar.map(
			(unidad) => unidad[1]
		);
		// Creamos un 'Set' a partir de ese array. Un Set es una estructura de datos
		// que, por definición, solo puede contener valores únicos.
		const nombresUnicos = new Set(nombresGenerados);
		// Comparamos el tamaño del array original con el tamaño del Set.
		// Si no son iguales, significa que hubo duplicados que el Set eliminó.
		if (nombresUnicos.size !== nombresGenerados.length) {
			throw new AppError(
				'El patrón de nombre que utilizaste ("' +
					patronNombre +
					'") generó nombres de unidad duplicados. Por favor, asegúrate de que tu patrón incluya un placeholder de piso (como {p} o {P}) si tienes más de un piso.',
				400
			);
		}

		if (unidadesParaInsertar.length === 0) {
			throw new AppError(
				'La configuración proporcionada no generó ninguna unidad.',
				400
			);
		}

		// --- 3. INSERCIÓN MASIVA EN LA BASE DE DATOS ---
		const sql = format(
			unidadQueries.INSERT_UNIDADES_MASIVO,
			unidadesParaInsertar
		);
		await db.query(sql);

		// --- 4. RESPUESTA EXITOSA ---
		res.status(201).json({
			success: true,
			message: `${unidadesParaInsertar.length} unidades han sido creadas exitosamente.`,
		});
	} catch (error) {
        if (error.code === '23505') {
            return next(new AppError('Una o más de las unidades generadas ya existen para este edificio.', 409));
        }
        next(error);
    }
};

module.exports = {
    generarUnidadesFlexible,
};

