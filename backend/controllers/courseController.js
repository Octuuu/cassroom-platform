const { Course, User } = require('../models');

const courseController = {
  // Crear curso (solo profesores/admins)
  createCourse: async (req, res) => {
    try {
      const { name, description } = req.body;
      const professorId = req.user.id; // ID del usuario logueado (JWT)

      const course = await Course.create({
        name,
        description,
        professorId
      });

      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el curso' });
    }
  },

  // Obtener todos los cursos
  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.findAll({
        include: [{
          model: User,
          as: 'professor',
          attributes: ['id', 'name', 'email']
        }]
      });
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener cursos' });
    }
  },

  // Inscribir estudiante a curso
  enrollStudent: async (req, res) => {
    try {
      const { courseId } = req.params;
      const studentId = req.user.id;

      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      await course.addStudent(studentId); // Método de Sequelize (asociación)
      res.json({ message: 'Inscripción exitosa' });
    } catch (error) {
      res.status(500).json({ error: 'Error al inscribir' });
    }
  }
};

module.exports = courseController;