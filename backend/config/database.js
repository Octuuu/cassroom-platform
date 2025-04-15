const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'), // Ruta absoluta
  logging: false // Desactiva logs en consola (opcional)
});

// Test de conexión
sequelize.authenticate()
  .then(() => console.log('✅ Conexión a SQLite establecida'))
  .catch(err => console.error('❌ Error de conexión:', err));

module.exports = sequelize;