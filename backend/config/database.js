const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({ 
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false
});

// test de conexion 
sequelize.authenticate()
    .then(() => console.log('conexion a sqlite establecida'))
    .catch(err => console.error('error de la conexion: ', err))

module.exports = sequelize;