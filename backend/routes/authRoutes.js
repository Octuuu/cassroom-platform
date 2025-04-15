const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', [
  check('firstName', 'El nombre es requerido').not().isEmpty(),
  check('lastName', 'El apellido es requerido').not().isEmpty(),
  check('email', 'Por favor incluye un email válido').isEmail(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
], authController.register);

// @route   POST /api/auth/login
// @desc    Iniciar sesión de usuario
// @access  Public
router.post('/login', [
  check('email', 'Por favor incluye un email válido').isEmail(),
  check('password', 'La contraseña es requerida').exists()
], authController.login);

module.exports = router;