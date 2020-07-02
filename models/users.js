const Sequelize = require('sequelize');
const db = require('../config/database');

const users = db.define('users', {
    name:{
        type: Sequelize.STRING
    },

    password:{
        type: Sequelize.STRING
    },

    email: {
        type: Sequelize.STRING
    },

    isAdmin: {
        type: Sequelize.BOOLEAN
    }
   
})

module.exports = users;