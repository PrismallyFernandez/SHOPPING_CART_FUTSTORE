var express = require('express');
var router = express.Router();
const csrf = require('csurf');
const passport = require('passport');
const Product = require('../models/producto');
const Cart = require('../models/carro');
const Order = require('../models/orden');
const User = require('../models/usuario');
const usuario = require('../models/usuario');
var auth = require('../config/auth');

var isAdmin = auth.isAdmin;


var csrfProtection = csrf();

router.use(csrfProtection);

/* User routes */

router.get('/profile', isLoggedIn, (req, res, next) => {
    Order.find({
        user: req.user
    }, function (err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function (order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', {
            orders: orders,
            title: 'Perfil'
        });
    });
});

router.get('/user-list', isAdmin, async (req, res) => {
    try {
        const users = await User.find({}).lean()
        console.log(users); 
        res.render('user/vista-usuario', { users});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener la lista de usuarios de la base de datos');
    }
});

router.get('/borrar/:id', isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndRemove(userId);
        req.flash('successMessage', 'Usuario eliminado con éxito');
        res.redirect('/usuario/user-list'); 
    } catch (error) {
        console.error(error);
        req.flash('errorMessage', 'Error al eliminar el usuario');
        res.status(500).send('Error al obtener la lista de usuarios de la base de datos');
    }
});

// const renderEditForm = async (req, res) => {
//     try {
//       const usuario = await User.findById(req.params.id).lean();
//       if (!usuario) {
//         req.flash("error_msg", "Usuario no encontrado");
//         return res.redirect("/usuario/user-list");
//       }
//       res.render("editar-usuario", { usuario });
//     } catch (error) {
//       console.error(error);
//       req.flash("error_msg", "Error al obtener el usuario de la base de datos");
//       res.redirect("/usuario/user-list");
//     }
//   };

//   const updateUser = async (req, res) => {
//     try {
//       const { email, nombre} = req.body;
//       await User.findByIdAndUpdate(req.params.id, { email , nombre });
//       req.flash("successMessage", "Usuario actualizado exitosamente");
//       res.redirect("/usuario/user-list");
//     } catch (error) {
//       console.error(error);
//       req.flash("error_msg", "Error al actualizar el usuario");
//       res.redirect("/usuario/user-list");
//     }
//   };
  
// router.get("/editar/:id", renderEditForm);

// router.post("/editar-usuario/:id", updateUser);



router.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/');
});

router.use('/', noLoggedIn, (req, res, next) => {
    next();
});

router.get('/signup', (req, res, next) => {
    let messages = req.flash('error');
    res.render('user/signup', {
        title: 'Sign Up',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/',
    failureRedirect: '/usuario/signup',
    failureFlash: true
}), (req, res, next) => {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/usuario/profile');
    }
});

router.get('/signin', (req, res, next) => {
    let messages = req.flash('error');
    res.render('user/signin', {
        title: 'Sign In',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    });
});

router.post('/signin', passport.authenticate('local.signin', {
    //successRedirect: '/user/profile',
    failureRedirect: '/usuario/signin',
    failureFlash: true
}), (req, res, next) => {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/');
    }
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function noLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}