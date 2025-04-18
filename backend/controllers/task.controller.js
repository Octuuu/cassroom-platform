const { Task, Course } = require('../models');

// Crear una tarea dentro de un curso
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    if (course.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para agregar tareas a este curso.' });
    }

    const task = await Task.create({ title, description, dueDate, courseId });
    res.status(201).json({ message: 'Tarea creada correctamente.', task });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la tarea.', error });
  }
};

// Obtener todas las tareas de un curso
exports.getTasksByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const tasks = await Task.findAll({ where: { courseId } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tareas.', error });
  }
};

// Obtener una tarea por ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la tarea.', error });
  }
};

// Actualizar una tarea
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    const course = await Course.findByPk(task.courseId);

    if (course.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para editar esta tarea.' });
    }

    const { title, description, dueDate } = req.body;
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;

    await task.save();
    res.json({ message: 'Tarea actualizada correctamente.', task });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la tarea.', error });
  }
};

// Eliminar una tarea
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    const course = await Course.findByPk(task.courseId);

    if (course.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta tarea.' });
    }

    await task.destroy();
    res.json({ message: 'Tarea eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la tarea.', error });
  }
};
