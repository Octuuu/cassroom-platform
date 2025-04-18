const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser } = require('../controllers/user.controller');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.get('/', auth, role('admin'), getAllUsers);
router.get('/:id', auth, getUserById);
router.delete('/:id', auth, role('admin'), deleteUser);

module.exports = router;
