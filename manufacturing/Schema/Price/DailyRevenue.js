const mongoose = require('mongoose');
const DailyRevenueSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    totalProduct: Number,
    totalCost: {
        type: Number,
        min: 0,
        default: 0
    },
    totalRevenue: {
        type: Number,
        min: 0,
        default: 0
    },
    totalProfit: {
        type: Number,
        default: 0
    }

});


module.exports = DailyRevenueSchema;