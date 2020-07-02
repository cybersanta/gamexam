const Sequelize = require('sequelize');
const db = require('../config/database');

const types = db.define('types', {
    name:{
        type: Sequelize.STRING
    },

    themeId: {
        type: Sequelize.INTEGER
    },

})

module.exports = types; 
