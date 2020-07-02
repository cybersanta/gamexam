const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const db = require('../config/database');

const url = require('url');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const tasks = require('../models/tasks');
const types = require('../models/types');
const themes = require('../models/themes');
const completedTasks = require('../models/completedTasks');

//Create Relations 
themes.hasMany(types);
types.belongsTo(themes);

types.hasMany(tasks);
tasks.belongsTo(types);


completedTasks.belongsTo(tasks);
tasks.hasMany(completedTasks);

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('in_or_up'));


// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res, next) => {
  const q = url.parse(req.url, true);
  let qdata = q.query;
  console.log(qdata);
  let userId = req.user.id;
  
  if (!qdata.theme) {
      themes.findAll({ include: [ types ]})
      .then(themes => {     
              res.render('dashboard' , {
                themes,
                user: req.user
          })
        
        })
    .catch(err => console.log(err));
  } else {
      tasks.sequelize.query('SELECT * FROM tasks WHERE id NOT IN (SELECT "taskId"  FROM "completedTasks" WHERE "userId" = ' + userId + ') AND "typeId" = '+ qdata.theme +' ORDER BY random() LIMIT 7' ,{type: tasks.sequelize.QueryTypes.SELECT})
          .then(tasks => {



                themes.findAll({ include: [ types ]})
                  .then(themes => {

                if(tasks.length == 0){
                  types.findByPk(qdata.theme).then(
                    nowTheme => {
                      res.render('dashboard4' , {
                        themes,
                        user: req.user,
                        nowTheme
                    })
                    })
                 
                } else

                    
                    types.findByPk(qdata.theme).then(
                      nowTheme => {
                        res.render('dashboard2' , {
                          themes,
                          user: req.user,
                          tasks,
                          nowTheme
                      })
                      })
                    })
      })
      .catch(err => console.log(err));
  }
});

router.post('/dashboard', (req, res) => {
  let result = {};
  for (let id in req.body ){
    console.log(id + ':' + req.body[id])
    result[id] = {}
    tasks.findByPk(id).then(tasks => {
      result[id]["id"] = tasks.id
      result[id]["description"] = tasks.description
      result[id]["solution"] = tasks.solution
      result[id]["answer"] = tasks.answer

      if(req.body[id] == tasks.answer) {
        result[id]["result"] = "Решено правильно"
        completedTasks.findOne({ where : { [Op.and]: [{taskId: id}, {userId: req.user.id}]}}).then(completedTask => {
          console.log(completedTask);
          
          if(!completedTask){
            completedTasks.create({ 
              taskId: id,
              userId: req.user.id
            })
          }
        })
        
      }else { 
        result[id]["result"] = "Решено неправильно"
      }
    })
  }

    themes.findAll({ include: [ types ]})
    .then(themes => {     
            res.render('dashboard3' , {
              themes,
              user: req.user,
              result,

        })
      
      })
    .catch(err => console.log(err));

  
})


module.exports = router;