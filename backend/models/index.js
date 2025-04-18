const { Sequelize } = require('sequelize');
const path = require('path');

// Configuración directa sin dependencia de archivo externo
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, '../database.sqlite'), // Ruta relativa mejorada
  logging: console.log, // Muestra logs SQL en consola
  define: {
    timestamps: true, // Habilita createdAt y updatedAt por defecto
    underscored: true // Usa snake_case en lugar de camelCase
  }
});

// Verificación de conexión inmediata
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida correctamente');
    
    // Sincronización inicial (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Modelos sincronizados');
    }
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error.message);
    process.exit(1); // Termina la aplicación si no puede conectarse
  }
})();

module.exports = sequelize;