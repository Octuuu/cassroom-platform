const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const socketService = require('./services/socketService');

const PORT = process.env.PORT || 3000;

// Iniciar servidor HTTP
const server = http.createServer(app);

// Iniciar WebSocket
socketService.init(server);

// Verificar conexión a la base de datos y sincronizar modelos
sequelize.authenticate()
  .then(() => {
    logger.info('✅ Conexión a la base de datos establecida');
    
    // Sincronizar modelos (sin forzar en producción)
    return sequelize.sync({
      force: process.env.NODE_ENV === 'development',
      alter: process.env.NODE_ENV === 'development'
    });
  })
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor escuchando en el puerto ${PORT}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      
      // Ejecutar tareas programadas
      if (process.env.NODE_ENV !== 'test') {
        require('./cronJobs');
      }
    });
  })
  .catch(error => {
    logger.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  });

// Manejo de cierre elegante
process.on('SIGTERM', () => {
  logger.info('🛑 Recibido SIGTERM. Cerrando servidor...');
  server.close(() => {
    sequelize.close();
    logger.info('🔴 Servidor cerrado');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});