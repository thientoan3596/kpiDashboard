const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// const UserSchema = require('../models/Users');
const UserSchema = require('../models/Schema/Users');

const { mongoUri: MongoURI } = require('../manufacturing/config/config');
const USERDATABASE = process.env.USERDATABASE || "dashboard";
function initialize(passport, getUserByUsername, getUserByID) {
    const conn = mongoose.createConnection(MongoURI + USERDATABASE);
    conn.on("open", () => {
        const User = conn.model("User", UserSchema);
        passport.use(
            new LocalStrategy({ usernameField: 'username', password: 'password' }, (username, password, done) => {
                User.findOne({ username })
                    .then(user => {
                        if (!user) {
                            return done(null, false, { message: 'No user found!' });
                        } else {
                            bcrypt.compare(password, user.password, (err, isMatch) => {
                                if (err) return done(err);
                                if (isMatch) return done(null, user);
                                return done(null, false, { message: 'Incorrect password!' });
                            })
                        }
                    })
                    .catch(err => console.log(err));
            })
        );
        passport.serializeUser((user, done) => done(null, user.id));
        passport.deserializeUser((id, done) => {
            User.findById(id)
                .then(user => { return done(null, user) })
                .catch(err => { done(err) })
        });
    })
    // const authenticateUser = (username, password, done) => {
    //     const user = getUserByUsername(username);
    //     if (!user) {
    //         return done(null, false, { message: 'no user found!' });
    //     }

    //     bcrypt.compare(password, user.password, (err, isMatch) => {
    //         if (err) done(err);
    //         if (isMatch) return done(null, user);
    //         return done(null, false, { message: 'Incorrect password' })
    //     })
    // }

}
module.exports = initialize;