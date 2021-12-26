const mongoose = require('mongoose');

const DowntimeSchema = new mongoose.Schema({
    start: String,
    end: String,
    duration: String,
    reason: String
});

DowntimeSchema.methods.findDuration = function () {
    if (this.start !== undefined && this.end !== undefined) {
        console.log('Chang Me');
    }
}

module.exports = DowntimeSchema;
