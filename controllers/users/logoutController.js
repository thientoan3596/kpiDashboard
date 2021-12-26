exports.logout = (req, res) => {
    if (req.isAuthenticated()) {
        req.logOut();
        res.redirect('/users/login');
    } else {
        res.redirect('/');
    }
}