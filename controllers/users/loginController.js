const bcrypt = require('bcryptjs');
const password = require('passport');
const login_index = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        const errors = req.flash('error');
        const msgs = req.flash('msgs');
        res.render('login', { msgs, errors });
    }
}
const login_auth = (req, res, next) => {
    password.authenticate('local', {
        successFlash: 'Welcome!',
        successRedirect: '/index',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
}

module.exports = {
    login_index,
    login_auth
};
