const mongoose = require('mongoose');


const PriceSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    time: String,
    material: {
        type: Number,
        min: 0,
        default: 0
    },
    paint: {
        type: Number,
        min: 0,
        default: 0
    },
    box: {
        type: Number,
        min: 0,
        default: 0
    },
    toolReplace: {
        type: Number,
        min: 0,
        default: 0
    },
    labour: {
        type: Number,
        min: 0,
        default: 0
    },

    sell: {
        type: Number,
        min: 0,
        default: 0
    }

});


module.exports = PriceSchema;