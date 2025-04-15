module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El nombre del curso es requerido'
          },
          len: {
            args: [3, 100],
            msg: 'El nombre debe tener entre 3 y 100 caracteres'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: true,
        unique: true
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'completed'),
        defaultValue: 'active'
      }
    });
  
    Course.associate = (models) => {
      Course.belongsTo(models.User, {
        foreignKey: 'professorId',
        as: 'professor'
      });
      Course.belongsToMany(models.User, {
        through: 'CourseStudents',
        as: 'students',
        foreignKey: 'courseId'
      });
      Course.hasMany(models.Task, {
        foreignKey: 'courseId',
        as: 'tasks'
      });
    };
  
    return Course;
  };