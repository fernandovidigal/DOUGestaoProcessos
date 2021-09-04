const Sequelize = require('sequelize');
const database = require('../helpers/database');

const Utilizadores = database.define('utilizadores', {
    utilizadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        isEmail: true,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nivel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    activo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
});

module.exports = Utilizadores;