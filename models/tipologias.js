const Sequelize = require('sequelize');
const database = require('../helpers/database');

const Tipologias = database.define('tipologias', {
  tipologiaId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  designacao: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Tipologias;
