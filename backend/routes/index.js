const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const courseRoutes = require('./courseRoutes');
const taskRoutes = require('./taskRoutes');

// Combinar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;