const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/users');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, (name, password, done) => {
      // Match user
      User.findOne({
        where: {name: name}
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Пользователя с таким именем не существует' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Неверный пароль' });
          }
        });
      });
    })
  );

  passport.serializeUser((user, done) => {
    console.log('serializing user: ', user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findByPk(id).then((user) => {
      done(null, user);
    }).catch(done);
  });
};