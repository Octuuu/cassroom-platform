const { Submission, Task, User } = require('../models');

// Crear una entrega para una tarea
exports.createSubmission = async (req, res) => {
  try {
    const { taskId } = req.body;
    
    // Verificar si la tarea existe
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    // Verificar si el usuario es estudiante (no puede ser el creador del curso ni un admin)
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Solo los estudiantes pueden entregar tareas.' });
    }

    // Crear la entrega
    const submission = await Submission.create({
      taskId,
      userId: req.user.id, // El estudiante que entrega la tarea
      content: req.body.content || null, // contenido de la entrega (opcional)
      file: req.file ? req.file.path : null, // Si hay archivo, se guarda en el servidor
    });

    res.status(201).json({ message: 'Tarea entregada correctamente.', submission });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la entrega.', error });
  }
};

// Obtener todas las entregas de una tarea
exports.getSubmissionsByTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const submissions = await Submission.findAll({
      where: { taskId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las entregas.', error });
  }
};

// Obtener una entrega por ID
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });

    if (!submission) {
      return res.status(404).json({ message: 'Entrega no encontrada.' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la entrega.', error });
  }
};

// Calificar una entrega (solo para profesores o admins)
exports.gradeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Entrega no encontrada.' });
    }

    // Solo el profesor o admin puede calificar
    if (req.user.role !== 'admin' && req.user.id !== submission.task.userId) {
      return res.status(403).json({ message: 'No tienes permiso para calificar esta entrega.' });
    }

    const { grade, feedback } = req.body;
    submission.grade = grade;
    submission.feedback = feedback;

    await submission.save();
    res.json({ message: 'Entrega calificada correctamente.', submission });
  } catch (error) {
    res.status(500).json({ message: 'Error al calificar la entrega.', error });
  }
};

// Eliminar una entrega (solo para estudiantes que entregaron y admins)
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Entrega no encontrada.' });
    }

    // Solo el estudiante que entregó o el admin puede eliminar la entrega
    if (submission.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta entrega.' });
    }

    await submission.destroy();
    res.json({ message: 'Entrega eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la entrega.', error });
  }
};
