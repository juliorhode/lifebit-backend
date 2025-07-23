const db = require('../../config/db');
const AppError = require('../../utils/appError');
const tokenUtils = require('../../utils/tokenUtils');
const emailService = require('../../services/emailService');
const usuarioQueries = require('../../queries/usuarioQueries');

/**
 * @description Invita a un nuevo residente al edificio del administrador.
 * @route POST /api/admin/residentes/invitar
 * @access Private (administrador)
 */
const invitarResidente = (req, res, next) => {
    const { nombre, apellido, email, telefono, cedula } = req.body;
}