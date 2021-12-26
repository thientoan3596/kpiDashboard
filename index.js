const path = require('path');
const moment = require('moment');
const ejs = require('ejs');
const mongoose = require('mongoose');
const fs = require('fs');
const port = process.env.PORT || 8035;
const { log } = require('./log');
// const host
let host = 'https://dashboard-thluon.herokuapp.com';
// let devHost = 'http://localhost';
try {
    let file = fs.readFileSync(path.join(__dirname, 'views', 'partials', 'head.ejs'), 'utf8');
    file = file.replace(/https:\/\/\b[^:]+\:\d+/, `${host}:${port}`);
    // file = file.replace("replaceME", `${devHost}:${port}`);
    fs.writeFileSync(path.join(__dirname, 'views', 'partials', 'head.ejs'), file, { encoding: 'utf8' });
    log(`set base url to ${host}:${port}`, 'SYSTEM');
} catch (error) {
    log(error, 'error');
    console.log(error);
}
const passport = require('passport');
const session = require('express-session');
const express = require('express');

const flash = require('connect-flash-plus');
const app = express();
const methodOverride = require('method-override');
const downtime = require('./manufacturing/simulators/downtime');
const production = require('./manufacturing/simulators/production');
//Const
const { mongoUri: MongoURI } = require('./manufacturing/config/config');
const systemEventObj = downtime.eventObj;
//User Model
const USERDATABASE = process.env.USERDATABASE || "dashboard";
const NotificationSchema = require("./models/Schema/Notification");
const Notification = mongoose.model("Notification", NotificationSchema);
let User = require('./models/Users');

const server = app.listen(port, () => {
    console.log(`Server started \nPort:${port}`)
    log(`server started at port ${port}`, "SYSTEM");
});

//DB Connection
// console.log(MongoURI);
mongoose.connect(MongoURI + USERDATABASE)
    .then(() => {
        log(`DB Connected ${MongoURI}`, 'SYSTEM');
        console.log("Database connected...");
        init();

    }).catch((err) => {
        log(`Connecting to DB with URI:${MongoURI}`, 'SYSTEM');
        log(err.message, 'error');
        console.log(err);
    });
// Passport Initialize

const initializePassport = require('./config/passport');
initializePassport(passport);


//EJS
app.set('view engine', 'ejs');
// app.use('', router);
//Middleware libs
// app.use(cookieParser());
const sessionMiddleware = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
})
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));



const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
const io = require('socket.io')(server);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
// io.use((socket, next) => {
//     if (socket.request.user) {
//         next();
//     } else {
//         next(new Error('unauthorized'))
//     }
// });
require('./controllers/index/indexIO')(io);
require('./controllers/notification/notificationsIO')(io);
require('./controllers/adminboard/adminboardIO')(io);
//Bodyparser


app.use('/', require('./route/index.js'));
app.use('/users', require("./route/users.js"));
app.use('/adminboard', require("./route/adminboard.js"));
app.use('/hiddenRoutegvxc', require("./route/hiddenRoute.js"));
app.use('/public', express.static(path.join(__dirname, 'views', 'public')));
app.get('*', (req, res) => {
    res.render('404', { user: req.user });
})

require('dotenv').config();
// const PORT = process.env.PORT;
// const Host = process.env.HOST;
// const server = app.listen(PORT, Host, () => console.log(`Server started at: http://${Host}:${PORT}`));
function init() {
    let msg = {};
    downtime.downtimeSimulate()
        .then(code => {
            msg.downtimeSimulate = code;
            return production.productionSimulate();
        })
        .then(code => {
            msg.productionSimulate = code;
            msg.message = 'Simulating';
            log(msg, 'SYSTEM');
        })
        .catch(err => {
            msg.message = 'Simulating failed';
            msg.error = err;

        })
}
