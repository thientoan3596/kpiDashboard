exports.index_get = (req, res) => {
    let success = req.flash('success');
    let msg = undefined;
    let msgType = undefined;
    if (success.length != 0) {
        msg = `Welcome back ${req.user.fname} ${req.user.lname}`;
        msgType = 'success'
    }
    let user = req.user;
    res.render('index', { user, msg, msgType });
}
exports.about_get = (req, res) => {
    let user = req.user;
    res.render('about', { user });
}

