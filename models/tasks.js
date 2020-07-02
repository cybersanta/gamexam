const Sequelize = require('sequelize');
const db = require('../config/database');

const tasks = db.define('tasks', {
    description:{
        type: Sequelize.TEXT
    },

    solution:{
        type: Sequelize.TEXT
    },

    answer: {
        type: Sequelize.TEXT
    },

    numberTask: {
        type: Sequelize.INTEGER
    },

    typeId: {
        type: Sequelize.INTEGER
    }

 
})

module.exports = tasks;