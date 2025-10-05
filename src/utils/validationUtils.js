// @typedef: Este es un tipo de comentario JSDoc que nos ayuda a definir "formas" de objetos. Aquí, estamos diciendo que el resultado de nuestra función será siempre un objeto con una propiedad booleana esValido y una propiedad mensaje que puede ser un string o null ({ esValido, mensaje }).
/**
 * @typedef {object} ValidationResult
 * @property {boolean} esValido - True si la contraseña cumple todas las reglas, de lo contrario false.
 * @property {string|null} mensaje - Un mensaje detallado del error si la validación falla.
 */

/**
 * @description Valida la fortaleza de una contraseña basándose en la política de seguridad definida.
 *
 * Política de Contraseñas:
 * - Mínimo 8 caracteres de longitud.
 * - Debe contener al menos una letra minúscula (a-z).
 * - Debe contener al menos una letra mayúscula (A-Z).
 * - Debe contener al menos un número (0-9).
 * - Debe contener al menos un carácter especial de la lista: !@#$%^&*
 *
 * @param {string} contraseña - La contraseña a validar.
 * @returns {ValidationResult} Un objeto que indica si la contraseña es válida y un mensaje de error si no lo es.
 */
const validarContraseña = (contraseña) => {
	// 1. Verificación de longitud mínima
	if (contraseña.length < 8) {
		return {
			esValido: false,
			mensaje: 'La contraseña debe tener al menos 8 caracteres.',
		};
	}

	// 2. Verificación de letra minúscula (usando expresión regular)
	//    /[a-z]/ busca si existe al menos una letra entre 'a' y 'z'.
	if (!/[a-z]/.test(contraseña)) {
		return {
			esValido: false,
			mensaje: 'La contraseña debe contener al menos una letra minúscula.',
		};
	}

	// 3. Verificación de letra mayúscula
	//    /[A-Z]/ busca si existe al menos una letra entre 'A' y 'Z'.
	if (!/[A-Z]/.test(contraseña)) {
		return {
			esValido: false,
			mensaje: 'La contraseña debe contener al menos una letra mayúscula.',
		};
	}

	// 4. Verificación de número
	//    /[0-9]/ busca si existe al menos un dígito entre '0' y '9'.
	if (!/[0-9]/.test(contraseña)) {
		return {
			esValido: false,
			mensaje: 'La contraseña debe contener al menos un número.',
		};
	}

	// 5. Verificación de carácter especial
	//    /[!@#$%^&*]/ busca si existe al menos uno de los caracteres dentro de los corchetes.
	if (!/[!@#$%^&*]/.test(contraseña)) {
		return {
			esValido: false,
			mensaje: 'La contraseña debe contener al menos un carácter especial (ej. !@#$%^&*).',
		};
	}

	// Si todas las verificaciones anteriores pasan, la contraseña es válida.
	return {
		esValido: true,
		mensaje: null,
	};
};

module.exports = {
	validarContraseña,
};
