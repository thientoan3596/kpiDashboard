
const downtime = require('../../manufacturing/simulators/downtime');
const production = require('../../manufacturing/simulators/production');
const price = require('../../manufacturing/simulators/price');
const sale = require('../../manufacturing/simulators/sale');
const path = require('path');
const bcrypt = require('bcryptjs');
exports.initialize = (req, res) => {
    let msg = {};
    downtime.downtimeGenerator()
        .then(code => {
            console.log(code);
            msg.downtimeGenerator = code;
            return production.productionGenerator();
        })
        .then(code => {
            console.log(code);
            msg.productionGenerator = code;
            return price.priceGenerator();
        }).then(code => {
            console.log(code);
            msg.priceGenerator = code;
            return sale.calculateRevenue();
        }).then(code => {
            msg.calculateRevenue = code;
            msg.message = 'Initialized';
            res.send(msg);
        }).catch((err) => {
            console.log(err);
            msg.error = err;
            msg.message = 'Initialization failed';
            res.json(msg);
        });

}
exports.simulate = (req, res) => {
    let msg = {};
    downtime.downtimeSimulate()
        .then(code => {
            msg.downtimeSimulate = code;
            return production.productionSimulate();
        })
        .then(code => {
            msg.productionSimulate = code;
            msg.message = 'Simulating';
            res.json(msg);
        })
        .catch(err => {
            msg.message = 'Simulating failed';
            msg.error = err;
            res.send(msg);
            console.log(err);
        })

}
exports.stopSimulate = (req, res) => {
    let productionSimulatingQuit = production.productionSimulating_Quit()
    let downtimeSimulatorQuit = downtime.downtimeSimulating_Quit();
    let msg = {
        message: 'Ending Simulators',
        productionSimulatingQuit,
        downtimeSimulatorQuit,
    }
    res.json(msg);
}
exports.turnOff = (req, res) => {
    downtime.turnOffSystem()
        .then(code => {
            msg = {
                message: 'success',
                code
            }
            res.json(msg);
        }).catch(err => {
            msg = {
                message: 'fail',
                code: err
            }
            res.json(msg);
        })

}
exports.turnOn = (req, res) => {
    downtime.turnOnSystem()
        .then(code => {
            msg = {
                message: 'success',
                code
            }
            res.json(msg);
        }).catch(err => {
            msg = {
                message: 'fail',
                code: err
            }
            res.json(msg);
        })
}
exports.download_log = (req, res) => {
    const file = path.join('log.txt');
    res.download(file); // 
}
exports.createAdmin = (req, res) => {

    username = "admin";
    firstName = "admin";
    lastName = "admin";
    inputPassword = "admin";

    User.findOne({ username: username })
        .then(user => {
            if (user) {
                req.flash('errors', 'Username exists!');
                const errors = req.flash('errors');
                res.json({
                    msg: 'Fail'
                });
                return;
            } else {
                const newUser = new User({
                    username,
                    fname: firstName,
                    lname: lastName,
                    password: inputPassword
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(async (user) => {
                                res.json({
                                    msg: 'done'
                                });
                            }).catch(err => {
                                res.json({
                                    msg: err
                                });
                                console.log(err);
                            });
                    });

                })
            }
        })
}