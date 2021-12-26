const mongoose = require('mongoose');

const { _time } = require("../../libs/util");
const DailyDowntimeSchema = new mongoose.Schema({
    date: {
        type: String,
        // default: moment().subtract(1, 'd').format('yyyy-MM-DD')
    },
    service: {
        type: String,
        default: '00:00'
    },
    brokenMachine: {
        type: String,
        default: '00:00'
    },
    other: {
        type: String,
        default: '00:00'
    },
    uncategozied: {
        type: String,
        default: '00:00'
    },
    total: {
        type: String,
        default: '00:00'
    },
});
DailyDowntimeSchema.pre('save', function (next) {
    this.total = _time._time(this.uncategozied).add(_time._time(this.other)).add(_time._time(this.brokenMachine)).add(_time._time(this.service)).toStr();
    // this.total = createTime(this.uncategozied).add({ hours: createTime(this.others).hour(), minutes: createTime(this.others).minute() }).add({ hours: createTime(this.brokenMachine).hour(), minutes: createTime(this.brokenMachine).minute() }).add({ hours: createTime(this.service).hour(), minutes: createTime(this.service).minute() }).format('HH:mm');
    next();
});
DailyDowntimeSchema.pre('updateOne', function (next) {
    this._update.total = _time._time(this._update.uncategozied).add(_time._time(this._update.other)).add(_time._time(this._update.brokenMachine)).add(_time._time(this._update.service)).toStr();
    // this.total = createTime(this.uncategozied).add({ hours: createTime(this.others).hour(), minutes: createTime(this.others).minute() }).add({ hours: createTime(this.brokenMachine).hour(), minutes: createTime(this.brokenMachine).minute() }).add({ hours: createTime(this.service).hour(), minutes: createTime(this.service).minute() }).format('HH:mm');
    next();
})

module.exports = DailyDowntimeSchema;
