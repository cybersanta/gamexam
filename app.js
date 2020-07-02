const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');

const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


// Passport Config
require('./config/passport')(passport);

//Database
const db = require('./config/database')

//Test DB
db.authenticate()
    .then(() => console.log('Database conected...'))
    .catch(err => console.log('Error: ' + err));


const app = express();

//Handlebars

let hbsHelpers = exphbs.create({
    helpers: require("./helpers/handlebars.js").helpers,
    defaultLayout: 'main',
    extname: '.handlebars'
});

app.engine('handlebars', hbsHelpers.engine);
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

  // Passport middleware
app.use(passport.initialize());
app.use(passport.session());

  // Connect flash
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

let requiresAdmin = function() {
  return [
    ensureLoggedIn('/users/login'),
    function(req, res, next) {
      if (req.user && req.user.isAdmin === true)
        next();
      else
        res.redirect('/dashboard');
    }
  ]
};

//Routs
app.use('/', require('./routes/index.js'));
app.all('/admin/*', requiresAdmin());
app.use('/admin', require('./routes/admin'));
app.use('/users', require('./routes/users'));



const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
