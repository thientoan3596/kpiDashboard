const mongoose = require('mongoose');
const { _time } = require('../../libs/util');

const DailyProductionSchema = new mongoose.Schema({
    date: String,
    productionTime: {
        type: Number,
        min: 0,
        default: 0
    },
    proccessA: {
        input: {
            type: Number,
            min: 0,
            default: 0
        },
        firstFinished: {
            type: Number,
            min: 0,
            default: 0
        },
        reworked: {
            type: Number,
            min: 0,
            default: 0
        },
        FPY: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    proccessB: {
        input: {
            type: Number,
            min: 0,
            default: 0
        },
        firstFinished: {
            type: Number,
            min: 0,
            default: 0
        },
        reworked: {
            type: Number,
            min: 0,
            default: 0
        },
        FPY: {
            type: Number,
            min: 0,
            default: 0
        }
    }, proccessC: {
        input: {
            type: Number,
            min: 0,
            default: 0
        },
        firstFinished: {
            type: Number,
            min: 0,
            default: 0
        },
        reworked: {
            type: Number,
            min: 0,
            default: 0
        },
        FPY: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    output: {
        type: Number,
        min: 0,
        default: 0
    },
    updateTime: {
        type: String,
        default: "23:59"
    },
    operatingTime: {
        type: Number,
        min: 0,
        default: 0
    },
    performance: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
    }
});
DailyProductionSchema.pre('save', function (next) {
    if (this.proccessA.input === 0) {
        this.proccessA.FPY = 0;
        this.proccessB.FPY = 0;
        this.proccessC.FPY = 0;
    } else {
        this.proccessA.FPY = +(this.proccessA.firstFinished / this.proccessA.input).toFixed(5);
        this.proccessB.FPY = +(this.proccessB.firstFinished / this.proccessB.input).toFixed(5);
        this.proccessC.FPY = +(this.proccessC.firstFinished / this.proccessC.input).toFixed(5);

    }
    next();
});
DailyProductionSchema.pre('updateOne', function (next) {
    if (this._update.proccessA.input === 0) {
        this._update.proccessA.FPY = 0;
        this._update.proccessB.FPY = 0;
        this._update.proccessC.FPY = 0;
    } else {
        this._update.proccessA.FPY = +(this._update.proccessA.firstFinished / this._update.proccessA.input).toFixed(5);
        this._update.proccessB.FPY = +(this._update.proccessB.firstFinished / this._update.proccessB.input).toFixed(5);
        this._update.proccessC.FPY = +(this._update.proccessC.firstFinished / this._update.proccessC.input).toFixed(5);

    }
    next();
});
DailyProductionSchema.pre('insertMany', function (next, docs) {
    docs.forEach(d => {
        if (d.proccessA.input != 0) {
            d.proccessA.FPY = +(d.proccessA.firstFinished / d.proccessA.input).toFixed(5);
            d.proccessB.FPY = +(d.proccessB.firstFinished / d.proccessB.input).toFixed(5);
            d.proccessC.FPY = +(d.proccessC.firstFinished / d.proccessC.input).toFixed(5);
        }
    })
    next();
});
// DailyProductionSchema.pre('insertMany', function (next) {
//     console.log('insertMany');
//     next();
// })

module.exports = DailyProductionSchema;