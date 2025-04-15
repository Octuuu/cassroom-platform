const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');
const { check } = require('express-validator');

// @route   GET /api/courses
// @desc    Obtener todos los cursos
// @access  Privado
router.get('/', authMiddleware, courseController.getAllCourses);

// @route   GET /api/courses/:id
// @desc    Obtener un curso por ID
// @access  Privado
router.get('/:id', authMiddleware, courseController.getCourseById);

// @route   POST /api/courses
// @desc    Crear nuevo curso
// @access  Privado (Profesor/Admin)
router.post('/', [
  authMiddleware,
  check('name', 'El nombre del curso es requerido').not().isEmpty(),
  check('startDate', 'La fecha de inicio es requerida').not().isEmpty(),
  check('endDate', 'La fecha de fin es requerida').not().isEmpty()
], courseController.createCourse);

// @route   PUT /api/courses/:id
// @desc    Actualizar curso
// @access  Privado (Profesor/Admin)
router.put('/:id', [
  authMiddleware,
  check('name', 'El nombre del curso es requerido').not().isEmpty()
], courseController.updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Eliminar curso
// @access  Privado (Profesor/Admin)
router.delete('/:id', authMiddleware, courseController.deleteCourse);

// @route   POST /api/courses/:id/enroll
// @desc    Inscribir estudiante a curso
// @access  Privado
router.post('/:id/enroll', authMiddleware, courseController.enrollStudent);

// @route   GET /api/courses/:id/students
// @desc    Obtener estudiantes de un curso
// @access  Privado (Profesor/Admin)
router.get('/:id/students', authMiddleware, courseController.getCourseStudents);

// @route   GET /api/courses/:id/tasks
// @desc    Obtener tareas de un curso
// @access  Privado
router.get('/:id/tasks', authMiddleware, courseController.getCourseTasks);

module.exports = router;