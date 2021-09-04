const Sequelize = require('sequelize');
const database = require('../helpers/database');

const Processos = database.define('processos', {
  processoId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  tipologiaId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  utilizadorId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  referencia: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null
  },
  designacao: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  estado: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  dataAbertura: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  dataFecho: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  },
});

module.exports = Processos;
