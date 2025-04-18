require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
const models = require('./models');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true }); // sincroniza con la base SQLite
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

startServer();
