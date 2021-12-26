const bcrypt = require('bcryptjs');
const _verifyCode = require('../../config')._verifyCode;
const mongoose = require('mongoose');
const Notification = mongoose.model('Notification', require('../../models/Schema/Notification'));
exports.register_get = function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        const errors = req.flash('errors');
        res.render('register', { errors });
    }
}
exports.register_post = function (req, res) {
    const { username, verifyCode, firstName, lastName, inputPassword, repeatPassword } = req.body;
    if (!username || !verifyCode || !firstName || !lastName || !inputPassword || !repeatPassword) {
        req.flash('errors', 'Please fill in all fields!');
        const errors = req.flash('errors');
        res.render('register', { errors, username, verifyCode, firstName, lastName, inputPassword, repeatPassword });
        return;
    }
    if (inputPassword !== repeatPassword) {
        req.flash('errors', 'Password not match!');
        const errors = req.flash('errors');
        res.render('register', { errors, username, verifyCode, firstName, lastName, inputPassword, repeatPassword });
        return;
    }
    if (verifyCode !== _verifyCode) {
        req.flash('errors', 'Please ask provider for verify code!');
        const errors = req.flash('errors');
        res.render('register', { errors, username, verifyCode, firstName, lastName, inputPassword, repeatPassword });
        return;
    };
    User.findOne({ username: username })
        .then(user => {
            if (user) {
                req.flash('errors', 'Username exists!');
                const errors = req.flash('errors');
                res.render('register', { errors, username, verifyCode, firstName, lastName, inputPassword, repeatPassword });
                return;
            } else {
                const newUser = new User({
                    username,
                    fname: firstName,
                    lname: lastName,
                    password: inputPassword
                });
                // console.log(User);
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        User.findOne({ username: "admin" })
                            .then(r => {

                                return Notification.create({
                                    msgType: 'info',
                                    msg: 'Account Created!\nWelcome',
                                    by: "61ac9b572096958f1275520f"
                                });
                            }).then((r) => {
                                // newUser.notifications=[];
                                newUser.notifications = [{
                                    notificationID: r._id,
                                }];
                                return newUser.save();
                            }).then(async (user) => {
                                req.flash('msgs', 'Account created');
                                res.redirect('/users/login');
                            }).catch(err => console.log(err));
                    });

                })
            }
        })
}