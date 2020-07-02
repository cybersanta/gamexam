const express = require('express');
const router = express.Router();
const {Sequelize} = require('sequelize');
const db = require('../config/database');

const tasks = require('../models/tasks');
const types = require('../models/types');
const themes = require('../models/themes');


////////////////////////////////////////////////////////////////////
//HOME
////////////////////////////////////////////////////////////////////


// Welcome Page
router.get('/', (req, res) => res.render('home-admin'));


////////////////////////////////////////////////////////////////////
//THEMES
////////////////////////////////////////////////////////////////////

//show themes
router.get('/themes', (req, res) =>
    themes.findAll()
        .then(themes => {
            console.log(themes);
            res.render('themes', {
                themes
            });
        })
        .catch(err => console.log(err)));


//add themes
router.post('/themes/add', (req, res) => {
    let {name} = req.body;
    themes.create({
        name,
    })
        .then(res.redirect('/admin/themes'))
        .catch(err => console.log(err));
});

//destroy themes
router.post('/themes/delete', (req, res) => {
    let {id} = req.body;

    themes.destroy({
        where: {id}
    })
        .then(res.redirect('/admin/themes'))
        .catch(err => console.log(err));
});

//update themes
router.post('/themes/update', (req, res) => {
    let {name, id} = req.body;

    themes.update(req.body, {
        name,
        where: {id}
    })
        .then(res.redirect('/admin/themes'))
        .catch(err => console.log(err));
});

////////////////////////////////////////////////////////////////////
//TYPES
////////////////////////////////////////////////////////////////////

//Create Relations 
themes.hasMany(types);
types.belongsTo(themes);

//show all types
router.get('/type', (req, res) =>
    types.findAll({include: [themes]})
        .then(types => {
            themes.findAll().then(themes => {
                res.render('type', {
                    types,
                    themes
                });
            })
        })
        .catch(err => console.log(err)));

//add types
router.post('/type/add', (req, res) => {
    let {themeId, name} = req.body;
    types.create({
        name,
        themeId
    })
        .then(res.redirect('/admin/type'))
        .catch(err => console.log(err));
});

//destroy types
router.post('/type/delete', (req, res) => {
    let {id} = req.body;

    types.destroy({
        where: {id}
    })
        .then(res.redirect('/admin/type'))
        .catch(err => console.log(err));
});

//update types
router.post('/type/update', (req, res) => {
    let {themeId, name, id} = req.body;

    types.update(req.body, {
        name,
        themeId,

        where: {id}
    })
        .then(res.redirect('/admin/type'))
        .catch(err => console.log(err));
});


////////////////////////////////////////////////////////////////////
//TASKS
////////////////////////////////////////////////////////////////////

//Create Relations 
types.hasMany(tasks);
tasks.belongsTo(types);


//show all tasks
router.get('/task', (req, res) =>
    tasks.findAll({include: [types]})
        .then(tasks => {
            types.findAll().then(types => {
                res.render('task', {
                    tasks,
                    types
                });
            })
        })
        .catch(err => console.log(err)));


//add tasks
router.post('/task/add', (req, res) => {
    let {typeId, description, solution, answer} = req.body;
    tasks.create({
        typeId,
        description,
        solution,
        answer
    })
        .then(res.redirect('/admin/task'))
        .catch(err => console.log(err));

});

//destroy tasks
router.post('/task/delete', (req, res) => {
    let {id} = req.body;

    tasks.destroy({
        where: {id}
    })
        .then(res.redirect('/admin/task'))
        .catch(err => console.log(err));
});

//update tasks
router.post('/task/update', (req, res) => {
    let {id, typeId, description, solution, answer} = req.body;

    tasks.update(req.body, {
        typeId,
        description,
        solution,
        answer,

        where: {id}
    })
        .then(res.redirect('/admin/task'))
        .catch(err => console.log(err));

});

///////////////////////////////////////////////////////
//PARSER
///////////////////////////////////////////////////////
const {PythonShell} = require('python-shell')

//addParse tasks
router.post('/task/addParse', (req, res) => {
    let {typeId, numberTask} = req.body;
    if (numberTask.indexOf("http") !== -1){
        let options = {
            mode: 'text',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: './parser/parser_python/parser',
            args: [numberTask],
            encoding: 'utf8'
        }
        PythonShell.run('index.py', options, function (err, results) {
            if (err) throw err;
            let task = JSON.parse(results[0])
            console.log(task)
            if ("Error" in task) {
                req.flash(
                    'error_msg',
                    task["Error"],

                )
                res.redirect('/admin/task')
            }else {
                let tasksArr = task["tasks"]
                for(let i = 0; i < tasksArr.length; i++){
                    let numberTask = tasksArr[i].number
                    let description = tasksArr[i].description
                    let solution = tasksArr[i].solution
                    let answer = tasksArr[i].answer
                    tasks.create({
                        typeId,
                        description,
                        solution,
                        answer,
                        numberTask,
                    })
                }
                res.redirect('/admin/task')
            }
        })
    }else {
        //Check required fields
        tasks.findOne({where: {numberTask}})
            .then(task => {
                if (task) {
                    req.flash(
                        'error_msg',
                        'Задание №'+numberTask+' уже существует'
                    )
                    res.redirect('/admin/task')
                }else {

                    let options = {
                        mode: 'text',
                        pythonOptions: ['-u'], // get print results in real-time
                        scriptPath: './parser/parser_python/parser',
                        args: [numberTask],
                        encoding: 'utf8'
                    }
                    PythonShell.run('index.py', options, function (err, results) {
                        if (err) throw err;
                        let task = JSON.parse(results[0])
                        console.log(task)
                        if ("Error" in task) {
                            req.flash(
                                'error_msg',
                                task["Error"],

                            )
                            res.redirect('/admin/task')
                        }else {
                            let description = task.description
                            let solution = task.solution
                            let answer = task.answer

                            tasks.create({
                                typeId,
                                description,
                                solution,
                                answer,
                                numberTask
                            })
                                .then(res.redirect('/admin/task'))
                                .catch(err => console.log(err));
                        }

                    });
                    // else if("tasks" in task) {
                    //         let tasks = task["tasks"]
                    //         for(let task = 0; task < tasks.length; task++){
                    //
                    //             let number = task.number
                    //             let description = task.description
                    //             let solution = task.solution
                    //             let answer = task.answer
                    //             tasks.create({
                    //                 typeId,
                    //                 description,
                    //                 solution,
                    //                 answer,
                    //                 number
                    //             })
                    //
                    //         }
                    //
                    //
                    //     }
                }
            })

    }



});

module.exports = router;