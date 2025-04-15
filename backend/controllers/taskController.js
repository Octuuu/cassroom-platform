const { Task, Course, Submission } = require('../models');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../storage/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage }).single('file');

const taskController = {
  // Crear tarea (profesor)
  createTask: async (req, res) => {
    try {
      const { courseId, title, description, dueDate } = req.body;
      const professorId = req.user.id;

      // Verificar que el curso exista y pertenezca al profesor
      const course = await Course.findOne({
        where: { id: courseId, professorId }
      });

      if (!course) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const task = await Task.create({
        title,
        description,
        dueDate,
        courseId
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear tarea' });
    }
  },

  // Subir entrega (estudiante) - Versión completa
  submitTask: async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al subir el archivo' });
      }

      try {
        const { taskId } = req.params;
        const studentId = req.user.id;
        const filePath = req.file.path;
        const originalName = req.file.originalname;

        // Verificar que la tarea exista
        const task = await Task.findByPk(taskId);
        if (!task) {
          // Eliminar el archivo subido si la tarea no existe
          fs.unlinkSync(filePath);
          return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        // Verificar que el estudiante esté inscrito en el curso
        const isEnrolled = await task.getCourse().then(course => 
          course.hasStudent(studentId)
        );
        
        if (!isEnrolled) {
          fs.unlinkSync(filePath);
          return res.status(403).json({ error: 'No estás inscrito en este curso' });
        }

        // Crear o actualizar la entrega
        const [submission, created] = await Submission.findOrCreate({
          where: { taskId, studentId },
          defaults: {
            filePath,
            originalName,
            submittedAt: new Date(),
            status: 'submitted'
          }
        });

        if (!created) {
          // Eliminar el archivo anterior si existe
          if (submission.filePath && fs.existsSync(submission.filePath)) {
            fs.unlinkSync(submission.filePath);
          }
          
          // Actualizar la entrega existente
          await submission.update({
            filePath,
            originalName,
            submittedAt: new Date(),
            status: 'submitted'
          });
        }

        res.json({ 
          message: 'Entrega subida exitosamente',
          submission: {
            id: submission.id,
            taskId: submission.taskId,
            submittedAt: submission.submittedAt,
            status: submission.status,
            originalName: submission.originalName
          }
        });
      } catch (error) {
        // Eliminar el archivo si hubo error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        console.error('Error al enviar tarea:', error);
        res.status(500).json({ error: 'Error al procesar la entrega' });
      }
    });
  }
};

module.exports = taskController;