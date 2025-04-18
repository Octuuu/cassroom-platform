const User = require('./user.model');
const Course = require('./course.model');
const Class = require('./class.model');
const Task = require('./task.model');
const Submission = require('./submission.model');

// Relaciones
User.hasMany(Course, { foreignKey: 'userId' });
Course.belongsTo(User, { foreignKey: 'userId' });

Course.hasMany(Class, { foreignKey: 'courseId' });
Class.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(Task, { foreignKey: 'courseId' });
Task.belongsTo(Course, { foreignKey: 'courseId' });

Task.hasMany(Submission, { foreignKey: 'taskId' });
Submission.belongsTo(Task, { foreignKey: 'taskId' });

User.hasMany(Submission, { foreignKey: 'userId' });
Submission.belongsTo(User, { foreignKey: 'userId' });

// Exportar modelos
module.exports = {
  User,
  Course,
  Class,
  Task,
  Submission,
};
