const Sequelize = require('sequelize');
const database = require('../helpers/database');

const Historico = database.define('historico', {
  historicoId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  processoId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  utilizadorId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  data: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  descricao: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});

module.exports = Historico;
