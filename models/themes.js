const Sequelize = require('sequelize');
const db = require('../config/database');

const themes = db.define('themes', {
 
    name:{
        type: Sequelize.STRING
    },

})

module.exports = themes;