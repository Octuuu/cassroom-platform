module.exports = (sequelize, DataTypes) => {
    const Submission = sequelize.define('Submission', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'La ruta del archivo es requerida'
          }
        }
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El nombre original del archivo es requerido'
          }
        }
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      grade: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: {
            args: [0],
            msg: 'La calificación no puede ser negativa'
          }
        }
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('submitted', 'graded', 'late', 'missing'),
        defaultValue: 'submitted'
      }
    });
  
    Submission.associate = (models) => {
      Submission.belongsTo(models.Task, {
        foreignKey: 'taskId',
        as: 'task'
      });
      Submission.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student'
      });
    };
  
    // Método de instancia para verificar si la entrega está atrasada
    Submission.prototype.isLate = function() {
      return this.submittedAt > this.task.dueDate;
    };
  
    return Submission;
  };