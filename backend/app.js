const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');
const dotenv = require('dotenv');
const routes = require('./routes');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();

// Configuración básica de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Limitar peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite por IP
});
app.use(limiter);

// Logs en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parseo del cuerpo de las peticiones
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Rutas principales
app.use('/api', routes);

// Manejo de errores
app.use(errors()); // Errores de validación con Joi
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;