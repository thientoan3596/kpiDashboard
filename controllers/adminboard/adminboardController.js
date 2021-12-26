


exports.adminboard_get = (req, res) => {
    let user = req.user;
    if (user != undefined) {
        res.render('adminboard', { user });
    } else {
        res.redirect('/users/login');
    }
}


