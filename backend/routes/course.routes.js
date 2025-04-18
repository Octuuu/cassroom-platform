const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} = require('../controllers/course.controller');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.post('/', auth, role('teacher'), createCourse);
router.get('/', auth, getCourses);
router.get('/:id', auth, getCourseById);
router.put('/:id', auth, role('teacher'), updateCourse);
router.delete('/:id', auth, role('teacher'), deleteCourse);

module.exports = router;
