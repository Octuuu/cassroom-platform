const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { check } = require('express-validator');

// @route   POST /api/courses/:courseId/tasks
// @desc    Crear nueva tarea
// @access  Privado (Profesor)
router.post('/:courseId/tasks', [
  authMiddleware,
  check('title', 'El título es requerido').not().isEmpty(),
  check('dueDate', 'La fecha límite es requerida').not().isEmpty()
], taskController.createTask);

// @route   GET /api/tasks/:id
// @desc    Obtener detalles de tarea
// @access  Privado
router.get('/:id', authMiddleware, taskController.getTaskDetails);

// @route   PUT /api/tasks/:id
// @desc    Actualizar tarea
// @access  Privado (Profesor)
router.put('/:id', [
  authMiddleware,
  check('title', 'El título es requerido').not().isEmpty()
], taskController.updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Eliminar tarea
// @access  Privado (Profesor)
router.delete('/:id', authMiddleware, taskController.deleteTask);

// @route   POST /api/tasks/:id/submit
// @desc    Enviar entrega de tarea
// @access  Privado (Estudiante)
router.post('/:id/submit', authMiddleware, taskController.submitTask);

// @route   GET /api/tasks/:id/submissions
// @desc    Obtener entregas de tarea (Profesor)
// @access  Privado (Profesor)
router.get('/:id/submissions', authMiddleware, taskController.getTaskSubmissions);

// @route   PUT /api/submissions/:id/grade
// @desc    Calificar entrega
// @access  Privado (Profesor)
router.put('/submissions/:id/grade', [
  authMiddleware,
  check('grade', 'La calificación es requerida').isNumeric()
], taskController.gradeTask);

module.exports = router;