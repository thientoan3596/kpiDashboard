exports.downtime = {
    database: 'downtime',
    generatingRate: 0.4,
    offRate: 0.005, //0.005
    onRate: 0.03, //0.03
}
exports.production = {
    database: 'production',
    inputPerMin: 60,
    maxDefectRate: {
        proccessA: 0.15,
        proccessB: 0.2,
        proccessC: 0.1
    }
}
exports.price = {
    database: 'price',
    simulatingFluctuateRate: 0.4,
    generatingFluctuateRate: 0.03,
    cost: {
        fluctuateMaxPercentage: {
            material: 0.1,
            paint: 0.05,
            box: 0.08,
            toolReplace: 0.03,
            labourCost: 0.02
        },
        basePriceList: {
            raw: {
                material: 9,
                paint: 0.5,
                box: 2.1
            },
            toolReplace: 0.3,
            labourCost: 8.5 //this is per worker per hour => should be x 60 workers
        }
    }, sell: {
        fluctuateMaxPercentage: 0.05,
        baseSellPrice: 16
    }
}

exports.sequenceInterval = 60000;
exports.downReasons = ['uncategozied', 'other', 'service', 'brokenMachine'];
exports.mongoUri = 'mongodb://127.0.0.1:27017/'
// exports.mongoUri = 'mongodb+srv://thluon-dashboard:dashboard-123@cluster0.2usxu.mongodb.net/'