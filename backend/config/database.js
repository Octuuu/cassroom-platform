const { Sequelize } = require('sequelize');
const path = require('path');

// Creamos una nueva instancia de Sequelize con SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'), // Ruta al archivo de la DB
  logging: false, // Cambiá a true si querés ver las queries en consola
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida con éxito.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

testConnection();

module.exports = sequelize;
