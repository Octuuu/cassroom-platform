const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Log del error
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Respuesta al cliente
  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

const notFoundMiddleware = (req, res, next) => {
  res.status(404);
  const error = new Error(`No encontrado - ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware
};