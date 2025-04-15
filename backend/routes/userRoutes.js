const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadProfilePicture = require('../middlewares/uploadProfilePicture');
const { check } = require('express-validator');

// @route   GET /api/users/me
// @desc    Obtener perfil de usuario actual
// @access  Privado
router.get('/me', authMiddleware, userController.getProfile);

// @route   PUT /api/users/me
// @desc    Actualizar perfil de usuario
// @access  Privado
router.put('/me', authMiddleware, userController.updateProfile);

// @route   POST /api/users/me/picture
// @desc    Subir foto de perfil
// @access  Privado
router.post('/me/picture', authMiddleware, uploadProfilePicture, userController.uploadProfilePicture);

// @route   GET /api/users
// @desc    Obtener todos los usuarios (Admin)
// @access  Privado (Admin)
router.get('/', authMiddleware, userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Obtener usuario por ID (Admin/Profesor)
// @access  Privado (Admin/Profesor)
router.get('/:id', authMiddleware, userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Actualizar usuario (Admin)
// @access  Privado (Admin)
router.put('/:id', authMiddleware, userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Eliminar usuario (Admin)
// @access  Privado (Admin)
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;