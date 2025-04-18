const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
  submitTask,
  getSubmissionsByTask,
  gradeSubmission
} = require('../controllers/submission.controller');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.post('/:taskId', auth, upload.single('file'), submitTask);
router.get('/:taskId', auth, role('teacher'), getSubmissionsByTask);
router.put('/grade/:id', auth, role('teacher'), gradeSubmission);

module.exports = router;
