const bcrypt = require('bcryptjs');


exports.profile_get = (req, res) => {
    let user = req.user;
    if (user) {
        let msgType;
        let msgs = req.flash('msgs');
        if (msgs.length != 0) {
            msgType = 'success';
        } else {
            msgs = req.flash('errors');
            if (msgs.length !== 0) {
                msgType = 'warning';
            }
        }
        if (msgs.length === 0) {
            msgs = undefined
            msgType = undefined
        }
        res.render('profile', { user, msgType, msg: msgs });
    } else {
        res.render('404');
    }
}
exports.change_password = (req, res) => {
    const { inputPassword, repeatPassword, oldPassword } = req.body
    if (inputPassword === repeatPassword) {
        bcrypt.compare(oldPassword, req.user.password, async (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                User.findOne({ username: req.user.username })
                    .then(async (user) => {
                        if (user) {
                            try {
                                let salt = await bcrypt.genSalt(10);
                                let hashStr = await bcrypt.hash(inputPassword, salt)
                                user.password = hashStr;
                                user.save();
                                req.flash('msgs', 'Password changed successfully!')
                            }
                            catch (err) {
                                req.flash('errors', 'Undefined Error!')
                                console.log(err);
                            }

                            return res.redirect('/users/profile');
                        } else {
                            req.flash('errors', 'Undefined Error!');
                            return res.redirect('/users/profile');
                        }
                    })
            } else {
                req.flash('errors', 'Incorrect password!');
                return res.redirect('/users/profile');
            }

        })
    } else {
        req.flash('errors', 'Passwords not match!');
        return res.redirect('/users/profile');
    }
}
exports.change_username = (req, res) => {
    const { username, password } = req.body;
    bcrypt.compare(password, req.user.password, async (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
            User.findOne({ username: req.user.username })
                .then(user => {
                    if (user) {
                        user.username = username;
                        req.flash('msgs', "Username has been changed!");
                        user.save();
                        return res.redirect('/users/profile');
                    } else {
                        req.flash('errors', "User name exists!");
                        return res.redirect('/users/profile');
                    }
                })
        } else {
            req.flash('errors', "Incorrect password!");
            return res.redirect('/users/profile');
        }
    })
}