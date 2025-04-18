const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByCourse,
  updateTask,
  deleteTask
} = require('../controllers/task.controller');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.post('/:courseId', auth, role('teacher'), createTask);
router.get('/:courseId', auth, getTasksByCourse);
router.put('/:id', auth, role('teacher'), updateTask);
router.delete('/:id', auth, role('teacher'), deleteTask);

module.exports = router;
