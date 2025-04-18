const express = require('express');
const router = express.Router();
const {
  createClass,
  getClassesByCourse,
  updateClass,
  deleteClass
} = require('../controllers/class.controller');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.post('/:courseId', auth, role('teacher'), createClass);
router.get('/:courseId', auth, getClassesByCourse);
router.put('/:id', auth, role('teacher'), updateClass);
router.delete('/:id', auth, role('teacher'), deleteClass);

module.exports = router;
