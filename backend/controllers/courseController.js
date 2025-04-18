const { Course, User } = require('../models');

const courseController = {
  // Crear curso (solo profesores/admins)
  createCourse: async (req, res) => {
    try {
      const { name, description } = req.body;
      const professorId = req.user.id;

      // Validar campos requeridos
      if (!name || !description) {
        return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
      }

      const course = await Course.create({
        name,
        description,
        professorId
      });

      res.status(201).json({
        message: 'Curso creado exitosamente',
        course: {
          id: course.id,
          name: course.name,
          description: course.description,
          professorId: course.professorId
        }
      });
    } catch (error) {
      console.error('Error al crear curso:', error);
      res.status(500).json({ error: 'Error al crear el curso', details: error.message });
    }
  },

  // Obtener todos los cursos con información del profesor
  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.findAll({
        include: [{
          model: User,
          as: 'professor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json(courses);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      res.status(500).json({ 
        error: 'Error al obtener cursos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

      // Verificar si el estudiante ya está inscrito
      const isEnrolled = await course.hasStudent(studentId);
      if (isEnrolled) {
        return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
      }

      await course.addStudent(studentId);
      
      res.json({ 
        message: 'Inscripción exitosa',
        course: {
          id: course.id,
          name: course.name
        }
      });
    } catch (error) {
      console.error('Error al inscribir estudiante:', error);
      res.status(500).json({ 
        error: 'Error al inscribir',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener estudiantes de un curso (para profesores)
  getCourseStudents: async (req, res) => {
    try {
      const { courseId } = req.params;

      const course = await Course.findByPk(courseId, {
        include: [{
          model: User,
          as: 'students',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: [] } // No incluir datos de la tabla intermedia
        }]
      });

      if (!course) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      res.json({
        courseId: course.id,
        courseName: course.name,
        students: course.students
      });
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
  },

  // Eliminar curso (solo profesor dueño o admin)
  deleteCourse: async (req, res) => {
    try {
      const { courseId } = req.params;

      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      await course.destroy();
      
      res.json({ message: 'Curso eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      res.status(500).json({ error: 'Error al eliminar curso' });
    }
  }
};

module.exports = courseController;