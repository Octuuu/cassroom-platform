const { Class, Course } = require('../models');

// Crear una clase dentro de un curso
exports.createClass = async (req, res) => {
  try {
    const { title, content, courseId } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    // Validar que el usuario sea el creador del curso o admin
    if (course.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para añadir clases a este curso.' });
    }

    const newClass = await Class.create({ title, content, courseId });
    res.status(201).json({ message: 'Clase creada correctamente.', class: newClass });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la clase.', error });
  }
};

// Obtener todas las clases de un curso
exports.getClassesByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const classes = await Class.findAll({ where: { courseId } });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clases.', error });
  }
};

// Obtener una clase por ID
exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Clase no encontrada.' });
    }

    res.json(classItem);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la clase.', error });
  }
};

// Actualizar una clase
exports.updateClass = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Clase no encontrada.' });
    }

    const course = await Course.findByPk(classItem.courseId);

    if (course.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para editar esta clase.' });
    }

    const { title, content } = req.body;
    classItem.title = title || classItem.title;
    classItem.content = content || classItem.content;

    await classItem.save();
    res.json({ message: 'Clase actualizada correctamente.', class: classItem });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la clase.', error });
  }
};

// Eliminar una clase
exports.deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id);

    if (!classItem) {
      return res.status(404).json({ message: 'Clase no encontrada.' });
    }

    const course = await Course.findByPk(classItem.courseId);

    if (course.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta clase.' });
    }

    await classItem.destroy();
    res.json({ message: 'Clase eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la clase.', error });
  }
};
