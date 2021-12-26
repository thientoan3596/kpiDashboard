const mongoose = require('mongoose');
const MonthlyRevenueSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    totalProduct: {
        type: Number,
        default: 0
    },
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
    },
    updatedBy:
    {
        type: String,
        required: true
    }

});


module.exports = MonthlyRevenueSchema;