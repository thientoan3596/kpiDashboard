const { systemStatus } = require('../system/info');
const { sequenceInterval, price: config, mongoUri, production, downtime } = require('../config/config');
const util = require('../libs/util');
const mongoose = require('mongoose');
const moment = require('moment');
const PriceSchema = require('../Schema/Price/Price');
const DailyRevenueSchema = require('../Schema/Price/DailyRevenue');
const DailyProductionSchema = require('../Schema/Production/DailyProduction');
const MonthlyRevenueSchema = require('../Schema/Price/MonthlyRevenue');
const cloneDeep = require('lodash.clonedeep');
const workersNR = 6;
const { log } = require('../../log');
//#region export functions
/**
 * Initialize the collections by calculating the revenue on different record
 * It is an initialize funcs must be ran only once, and after initialize downtime,production and price.
 * @param {number} length 
 * @returns {Promise} - code ['revenue', 'calculating', 'success'] | ['revenue', 'calculating', 'failure']
 */
function calculateRevenue(length = 365) {
    return new Promise((resolve, reject) => {
        if (systemStatus.isRunning) {
            return reject(util.createCode(['revenue', 'calculating', 'failure']) + ' ' + util.createCode(['system', 'running']));
        } else if (systemStatus.isSimulating) {
            return reject(util.createCode(['revenue', 'calculating', 'failure']) + ' ' + util.createCode(['system', 'simulating']));
        } else {

            const revConn = mongoose.createConnection(mongoUri + config.database);
            const prodConn = mongoose.createConnection(mongoUri + production.database);
            revConn.on('open', async () => {
                try {
                    // const dailyCollExist = await util.collectionExist('dailyrevenues', revConn);
                    try {
                        await revConn.db.dropCollection('dailyrevenues');

                    } catch (error) {
                        log('calulating revenue> clearing daily revenues old data', 'SYSTEM');
                        log(error.message, 'error');
                        console.log(error.message);
                    }

                    try {
                        await revConn.db.dropCollection('monthlyrevenues');

                    } catch (error) {
                        log('calulating revenue> clearing monthly revenues old data', 'SYSTEM');
                        log(error.message, 'error');
                        console.log(error.message);
                    }
                    const DailyRevenueModel = revConn.model('DailyRevenue', DailyRevenueSchema);
                    const DailyProductionModel = prodConn.model('DailyProduction', DailyProductionSchema);
                    const PriceModel = revConn.model('Price', PriceSchema);
                    const MonthlyRevenueModel = revConn.model('MonthlyRevenue', MonthlyRevenueSchema);
                    const priceRecords = await PriceModel.find({});
                    let priceCounter = 0;
                    let productionRecords = await DailyProductionModel.find({});
                    const dailyRevenueRecords = [];
                    // let calculatingDate = moment().subtract(length, 'day');
                    // console.log(productionRecords[length - 1], "vs", length);
                    length--;
                    while (length > 0) {
                        if (priceRecords[priceCounter + 1] !== undefined) {
                            if (priceRecords[priceCounter + 1].date == moment().subtract(length, 'day').format('yyyy-MM-DD')) {
                                priceCounter++;
                            }
                        }
                        let totalMaterialCost = productionRecords[length].proccessA.input * priceRecords[priceCounter].material;
                        let totalPaintCost = productionRecords[length].proccessB.input * priceRecords[priceCounter].paint;
                        let totalBoxCost = productionRecords[length].proccessC.input * priceRecords[priceCounter].box;
                        let totalToolReplacementCost = (productionRecords[length].proccessA.reworked + productionRecords[length].proccessC.reworked + productionRecords[length].proccessC.reworked) * priceRecords[priceCounter].toolReplace;
                        let totalLabourCost = (Math.ceil(productionRecords[length].productionTime / 60)) * priceRecords[priceCounter].labour * workersNR;
                        let totalRevenue = productionRecords[length].output * priceRecords[priceCounter].sell;
                        totalRevenue = util.round(totalRevenue, 2);
                        let totalCost = totalMaterialCost + totalPaintCost + totalBoxCost + totalToolReplacementCost + totalLabourCost;
                        totalCost = util.round(totalCost, 2);
                        let totalProfit = totalRevenue - totalCost;
                        totalProfit = util.round(totalProfit, 2);
                        let dailyRevenueRecord = {
                            date: moment().subtract(length, 'day').format('yyyy-MM-DD'),
                            totalProduct: productionRecords[length].output,
                            totalCost,
                            totalRevenue,
                            totalProfit
                        }
                        dailyRevenueRecords.push(dailyRevenueRecord);
                        // productionCounter++;
                        length--;
                    }
                    await DailyRevenueModel.insertMany(dailyRevenueRecords);
                    let MonthlyRecords = [];
                    let MonthlyRecord = {
                        date: 0,
                        totalProduct: 0,
                        totalCost: 0,
                        totalRevenue: 0,
                        totalProfit: 0,
                        updatedBy: 'undefined'
                    }
                    for (let counter = 0; counter < dailyRevenueRecords.length; counter++) {
                        MonthlyRecord.totalProduct += dailyRevenueRecords[counter].totalProduct;
                        MonthlyRecord.totalCost += dailyRevenueRecords[counter].totalCost;
                        MonthlyRecord.totalRevenue += dailyRevenueRecords[counter].totalRevenue;
                        MonthlyRecord.totalProfit += dailyRevenueRecords[counter].totalProfit;
                        if (moment(dailyRevenueRecords[counter].date, 'yyyy-MM-DD').isSame(moment(dailyRevenueRecords[counter].date, 'yyyy-MM-DD').endOf('month'), 'day')) {
                            MonthlyRecord.date = moment(dailyRevenueRecords[counter].date, 'yyyy-MM-DD').format('yyyy-MMMM');
                            MonthlyRecord.totalProduct = util.round(MonthlyRecord.totalProduct, 2);
                            MonthlyRecord.totalCost = util.round(MonthlyRecord.totalCost, 2);
                            MonthlyRecord.totalRevenue = util.round(MonthlyRecord.totalRevenue, 2);
                            MonthlyRecord.totalProfit = util.round(MonthlyRecord.totalProfit, 2);
                            MonthlyRecord.updatedBy = dailyRevenueRecords[counter].date;
                            MonthlyRecords.push(cloneDeep(MonthlyRecord));
                            MonthlyRecord = {
                                date: 0,
                                totalProduct: 0,
                                totalCost: 0,
                                totalRevenue: 0,
                                totalProfit: 0,
                                updatedBy: 'undefined'
                            }
                        }
                    }
                    MonthlyRecord.updatedBy = dailyRevenueRecords[dailyRevenueRecords.length - 1].date;
                    MonthlyRecord.date = moment(MonthlyRecord.updatedBy, 'yyyy-MM-DD').format('yyyy-MMMM');
                    MonthlyRecords.push(cloneDeep(MonthlyRecord));
                    await MonthlyRevenueModel.insertMany(MonthlyRecords);
                    log('Revenue data initialized', 'SYSTEM');
                    resolve(util.createCode(['revenue', 'calculating', 'success']));

                } catch (error) {
                    log('Initializing revenue data', 'SYSTEM');
                    log(error.message, 'error');
                    console.log(error);
                    reject(util.createCode(['revenue', 'calculating', 'failure']) + ' ' + util.createCode(['undefined']));
                } finally {
                    revConn.close();
                    prodConn.close();
                }
            })


        }
    });
}
/**
 * update the revenue of yesterday to daily and monthly record.
 * @returns {Promise}
 */
function updateRevenue() {
    return new Promise(async (resolve, reject) => {
        const revConn = mongoose.createConnection(mongoUri + config.database);
        const prodConn = mongoose.createConnection(mongoUri + production.database);
        try {
            let yesterday = moment().subtract(1, 'day');
            const DailyRevenueModel = revConn.model('DailyRevenue', DailyRevenueSchema);
            const DailyProductionModel = prodConn.model('DailyProduction', DailyProductionSchema);
            const PriceModel = revConn.model('Price', PriceSchema);
            const MonthlyRevenueModel = revConn.model('MonthlyRevenue', MonthlyRevenueSchema);
            if (await DailyRevenueModel.findOne({ date: yesterday.format('yyyy-MM-DD') }) == null) {
                const priceRecords = await PriceModel.find({});
                let productionRecords = await DailyProductionModel.find({});

                let totalMaterialCost = productionRecords.at(-1).proccessA.input * priceRecords.at(-1).material;
                let totalPaintCost = productionRecords.at(-1).proccessB.input * priceRecords.at(-1).paint;
                let totalBoxCost = productionRecords.at(-1).proccessC.input * priceRecords.at(-1).box;
                let totalToolReplacementCost = (productionRecords.at(-1).proccessA.reworked + productionRecords.at(-1).proccessC.reworked + productionRecords.at(-1).proccessC.reworked) * priceRecords.at(-1).toolReplace;
                let totalLabourCost = (Math.ceil(productionRecords.at(-1).productionTime / 60)) * priceRecords.at(-1).labour * workersNR;
                let totalRevenue = productionRecords.at(-1).output * priceRecords.at(-1).sell;
                totalRevenue = util.round(totalRevenue, 2);
                let totalCost = totalMaterialCost + totalPaintCost + totalBoxCost + totalToolReplacementCost + totalLabourCost;
                totalCost = util.round(totalCost, 2);
                let totalProfit = totalRevenue - totalCost;
                totalProfit = util.round(totalProfit, 2);
                let dailyRevenueRecord = {
                    date: yesterday.format('yyyy-MM-DD'),
                    totalProduct: productionRecords.at(-1).output,
                    totalCost,
                    totalRevenue,
                    totalProfit,
                }
                await DailyRevenueModel.create(dailyRevenueRecord);
                const MonthlyRecord = await MonthlyRevenueModel.findOne({ date: yesterday.format('yyyy-MMMM') });
                if (MonthlyRecord == null) {
                    const newMonthlyRecord = {
                        date: yesterday.format('yyyy-MMMM'),
                        totalProduct: dailyRevenueRecord.totalProduct,
                        totalCost: dailyRevenueRecord.totalCost,
                        totalRevenue: dailyRevenueRecord.totalRevenue,
                        totalProfit: dailyRevenueRecord.totalProfit,
                        updatedBy: yesterday.format('yyyy-MM-DD'),
                    }
                    await MonthlyRevenueModel.create(newMonthlyRecord);

                } else {
                    if (MonthlyRecord.updatedBy !== yesterday.format('yyyy-MM-DD')) {
                        MonthlyRecord.totalProduct += dailyRevenueRecord.totalProduct;
                        MonthlyRecord.totalCost += dailyRevenueRecord.totalCost;
                        MonthlyRecord.totalRevenue += dailyRevenueRecord.totalRevenue;
                        MonthlyRecord.totalProfit += dailyRevenueRecord.totalProfit;
                        MonthlyRecord.updatedBy += yesterday.format('yyyy-MM-DD');
                        await MonthlyRevenueModel.updateOne({ date: MonthlyRecord.date }, newMonthlyRecord);
                    }
                }
            }

            resolve(util.createCode(['revenue', 'calculating', 'success']));
        } catch (error) {
            console.log(error);
            reject(util.createCode(['revenue', 'calculating', 'failure']) + ' ' + util.createCode(['undefined']));
        } finally {
            revConn.close();
            prodConn.close();
        }

    });
}


//#endregion


// calculateRevenue();


module.exports = {
    calculateRevenue,
    updateRevenue
};
