const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/classes', require('./routes/class.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/submissions', require('./routes/submission.routes'));

module.exports = app;
