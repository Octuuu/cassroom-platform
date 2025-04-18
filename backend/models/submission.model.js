const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  content: DataTypes.TEXT,
  file: DataTypes.STRING,
  grade: DataTypes.FLOAT,
  feedback: DataTypes.TEXT,
});

module.exports = Submission;
