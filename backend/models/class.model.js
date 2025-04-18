const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: DataTypes.TEXT,
  videoUrl: DataTypes.STRING,
});

module.exports = Class;
