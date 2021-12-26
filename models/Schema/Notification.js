const mongoose = require('mongoose');
const moment = require('moment');
const NotificationSchema = new mongoose.Schema({
    msgType: {
        type: String,
        immutable: true,
        required: true
    },
    msg: {
        type: String,
        immutable: true,
        required: true,
    },
    by: { type: mongoose.Schema.Types.ObjectId }
    ,
    _time: {
        type: String,
        immutable: true,
        default: () => moment().format('MMMM DD,yyyy \t|\t HH:mm'),
    }
});

module.exports = NotificationSchema;