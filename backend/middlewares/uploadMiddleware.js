const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuración común para almacenamiento
const configureStorage = (folder, allowedTypes, maxSizeMB) => {
  const uploadPath = path.join(__dirname, `../storage/${folder}`);
  
  // Crear directorio si no existe
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
};

// Middleware para subir archivos genérico
const createUploadMiddleware = (folder, allowedTypes, maxSizeMB = 5) => {
  const storage = configureStorage(folder, allowedTypes, maxSizeMB);
  
  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido. Solo: ${allowedTypes.join(', ')}`), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 }
  }).single('file');
};

// Middlewares específicos
const uploadProfilePicture = createUploadMiddleware(
  'profiles', 
  ['.jpg', '.jpeg', '.png', '.gif'],
  2 // 2MB
);

const uploadTaskFile = createUploadMiddleware(
  'tasks',
  ['.pdf', '.doc', '.docx', '.zip', '.rar', '.txt', '.pptx', '.xls', '.xlsx'],
  10 // 10MB
);

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = {
  uploadProfilePicture,
  uploadTaskFile,
  errorHandler
};