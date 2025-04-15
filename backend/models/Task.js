module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El título de la tarea es requerido'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      maxScore: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 100,
        validate: {
          min: {
            args: [0],
            msg: 'La puntuación máxima no puede ser negativa'
          }
        }
      },
      taskType: {
        type: DataTypes.ENUM('homework', 'quiz', 'project', 'exam'),
        defaultValue: 'homework'
      }
    });
  
    Task.associate = (models) => {
      Task.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });
      Task.hasMany(models.Submission, {
        foreignKey: 'taskId',
        as: 'submissions'
      });
    };
  
    return Task;
  };