var createError = require('http-errors');
var express = require('express');
var favicon = require('serve-favicon')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');
//const MongoStore = require('mongo-connection')(session);
const MongoStore = require('connect-mongo')(session);
const User = require('./models/usuario'); // Ajusta la ruta según la ubicación de tu archivo usuario.js


//manage views partials hbs
const expressHsb = require('express-handlebars');

//routes
var indexRouter = require('./routes/index');
var userRouter = require('./routes/usuario');
var productRouter = require('./routes/producto')

var app = express();


mongoose.connect('mongodb://localhost:27017/carrito', { useNewUrlParser: true, useUnifiedTopology: true });
   
    const defaultAdmin = {
      email: 'admin@example.com',
      nombre: 'Admin',
      password: 'admin123', 
      admin: 1
  };
  
  User.findOne({ email: defaultAdmin.email }, (err, existingUser) => {
      if (err) {
          console.error(err);
          return;
      }
  
      if (!existingUser) {
          const newUser = new User(defaultAdmin);
          newUser.password = newUser.encryptPassword(defaultAdmin.password);
  
          newUser.save((err) => {
              if (err) {
                  console.error(err);
                  return;
              }
              console.log('Usuario admin por defecto creado.');
          });
      } else {
          console.log('Ya existe un usuario admin en la base de datos.');
      }
  });



require('./config/passport');


// view engine setup
app.engine('.hbs', expressHsb({
  defaultLayout: 'layout',
  extname: '.hbs'
}));
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');
app.set('view engine', '.hbs');

app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use(validator());

app.use(cookieParser());

app.use(session({
  secret: 'mysupersecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie: {
    maxAge: 180 * 160 * 1000
  }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.loggin = req.isAuthenticated();
  res.locals.session = req.session;
  next();
})
//routes use
app.use('/usuario', userRouter);
app.use('/', indexRouter);
app.use('/producto', productRouter)

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;