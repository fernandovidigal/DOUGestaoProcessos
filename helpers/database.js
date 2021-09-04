const Sequelize = require('sequelize');
const { databasePath } = require('./appPaths');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: databasePath,
    logging: false,
    define: {
        timestamps: false
    }
});

module.exports = sequelize;