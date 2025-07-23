const crypto = require('crypto')

/**
 * @description Genera un par de tokens: uno para el usuario y su versión hasheada para la BD.
 * @returns {object} Un objeto que contiene el 'tokenPlano' y el 'tokenHasheado'.
 */
const generaTokenRegistro = () => {
	// 1. Generamos un token aleatorio de 32 bytes.
	// crypto.randomBytes(32) crea un buffer de 32 bytes de datos criptográficamente seguros.
	const tokenPlano = crypto.randomBytes(32).toString('hex')
	// 2. Hasheamos el token que se guardará en la base de datos.
	// Usamos el algoritmo SHA256, que es un estándar para este propósito.
    // Es rápido y seguro para hashear tokens de un solo uso.
    const tokenHasheado = crypto.createHash('sha256').update(tokenPlano).digest('hex')
    // 3. Devolvemos ambas versiones.
    return {tokenPlano,tokenHasheado}
}

module.exports = {
    generaTokenRegistro
}