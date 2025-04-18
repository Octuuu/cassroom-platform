const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const uploadProfilePicture = require('../middlewares/uploadProfilePicture');

// Rutas públicas (sin autenticación)
// ...

// Rutas privadas
router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, userController.updateProfile);
router.post('/me/picture', authenticate, uploadProfilePicture, userController.uploadProfilePicture);

// Rutas solo para administradores
router.get('/', authenticate, isAdmin, userController.getAllUsers);
router.get('/:id', authenticate, isAdmin, userController.getUserById);
router.put('/:id', authenticate, isAdmin, userController.updateUser);
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

module.exports = router;