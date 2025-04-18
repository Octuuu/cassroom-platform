module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre es requerido'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El apellido es requerido'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Debe ser un correo electrónico válido'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      defaultValue: 'student'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: 'professorId',
      as: 'taughtCourses'
    });
    User.belongsToMany(models.Course, {
      through: 'CourseStudents',
      as: 'enrolledCourses',
      foreignKey: 'userId'
    });
    User.hasMany(models.Submission, {
      foreignKey: 'studentId',
      as: 'submissions'
    });
  };

  return User;
};