const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/users');
const { forwardAuthenticated } = require('../config/auth');


// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));


// Register Handle

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = []; 

    //Check required fields 
    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Пожалуйста, заполните все поля' })
    }
    
    //Check password match 
    if (password !== password2) {
        errors.push({ msg: 'Пароли не совпадают' })
    }

    //Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Пароль должен быть больше 6 символов' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        //Validation passed
        const Sequelize = require('sequelize');
        const Op = Sequelize.Op;
        User.findOne({ where : { [Op.or]: [{email}, {name}]}})
            .then(user => {
                if (user) {
                    
                    if(user.name === name){
                        errors.push({ msg: 'Пользователь с таким именем уже существует' })
                    }
                    if(user.email === email){
                        errors.push({ msg: 'Пользователь с таким email уже существует' })
                    }
                    
                //User exist 
                
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    })  
                } else {

                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash password

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                            req.flash(
                                'success_msg',
                                'Вы зарегистрировались и можете зайти в аккаунт'
                            );
                            res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                        });
                    });
                }
        })
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout
  router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Вы вышли из системы');
    res.redirect('/users/login');
  });


module.exports = router;