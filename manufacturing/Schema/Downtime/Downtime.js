const mongoose = require('mongoose');
const { downReasons } = require('../../config/config')


const DowntimeSchema = new mongoose.Schema({
    date: String,
    details: [
        {
            start: String,
            end: String,
            duration: String,
            reason: {
                type: String,
                enum: downReasons,
                default: downReasons[0]
            },
            by: {
                type: mongoose.Schema.Types.ObjectId,
                default: '61ac9b572096958f1275520f',
            }
        }
    ],
});
DowntimeSchema.pre('save', function (next) {
    next();
})
DowntimeSchema.methods.findDuration = function () {
    if (this.start !== undefined && this.end !== undefined) {
        console.log('Chang Me');
    }
}

module.exports = DowntimeSchema;
