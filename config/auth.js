exports.isUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Favor de Ingresar.');
        res.redirect('/usuario/signin');
    }
}

exports.isAdmin = function(req, res, next) {
    console.log('Middleware isAdmin ejecutándose...');
    if (req.isAuthenticated() && req.user.admin == 1) {
        console.log('Usuario autenticado como administrador. Permitiendo acceso.');
        next();
    } else {
        console.log('Usuario no autenticado como administrador. Bloqueando acceso.');
        req.flash('danger', 'Ingresar como Administrador.');
        res.redirect('/usuario/signin');
    }
}

