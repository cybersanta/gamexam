const Sequelize = require('sequelize');
const db = require('../config/database');

const completedtasks = db.define('completedTasks', {

    userId: {
        type: Sequelize.INTEGER
    },

    taskId: {
        type: Sequelize.INTEGER
    }
    
})

module.exports = completedtasks;