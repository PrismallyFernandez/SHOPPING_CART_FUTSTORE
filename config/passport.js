const passport = require('passport');
const User = require('../models/usuario');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody('email', 'Correo Inválido').notEmpty().isEmail();
    req.checkBody('password', 'Contraseña Inválida').notEmpty().isLength({
        min: 5
    });
    req.checkBody('nombre', 'Nombre is required').notEmpty();
    req.checkBody('isAdmin');
    
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(error => {
            messages.push(error.msg);
        })
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({
        'email': email
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {
                'message': 'Correo en Uso'
            });
        }
        let newUser = new User();
        newUser.email = email;
        newUser.nombre = req.body.nombre; // Asigna el nombre desde el cuerpo de la solicitud
        newUser.password = newUser.encryptPassword(password);
        newUser.isAdmin = req.body.isAdmin; // Usa el método de instancia para encriptar la contraseña
        newUser.save((err, res) => {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    })
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody('email', 'Correo Inválido').notEmpty().isEmail();
    req.checkBody('password', 'Contraseña incorrecta').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(error => {
            messages.push(error.msg);
        })
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({
        'email': email
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                'message': 'Usuario No Encontrado.'
            });
        }
        if (!user.validPassword(password)) {
            return done(null, false, {
                'message': 'Contraseña Incorrecta.'
            });
        }
        return done(null, user);
    })
}));
