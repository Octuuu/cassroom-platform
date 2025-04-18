const { Course, User } = require('../models');

// Crear un curso (solo profesores o admins)
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    const course = await Course.create({
      title,
      description,
      userId: req.user.id, // El profesor que lo crea
    });

    res.status(201).json({ message: 'Curso creado correctamente.', course });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el curso.', error });
  }
};

// Obtener todos los cursos
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cursos.', error });
  }
};

// Obtener un curso por ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
    });

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el curso.', error });
  }
};

// Actualizar un curso (solo el creador puede)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    if (course.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para editar este curso.' });
    }

    const { title, description } = req.body;
    course.title = title || course.title;
    course.description = description || course.description;

    await course.save();
    res.json({ message: 'Curso actualizado correctamente.', course });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el curso.', error });
  }
};

// Eliminar un curso
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    if (course.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este curso.' });
    }

    await course.destroy();
    res.json({ message: 'Curso eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el curso.', error });
  }
};
