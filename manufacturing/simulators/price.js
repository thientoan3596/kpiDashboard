const { systemStatus } = require('../system/info');
const { price: config, mongoUri } = require('../config/config');
const util = require('../libs/util');
const mongoose = require('mongoose');
const moment = require('moment');
const PriceSchema = require('../Schema/Price/Price');

const cloneDeep = require('lodash.clonedeep');
const { eventObj: downtimeEvent } = require('./downtime');
const Event = require('events');
let eventObj = new Event();
const log = require('../../log');

//#region Export

/**
 * Getting latest price list record
 * @returns {Promise<PriceListObj|errorCode>}
 */
function getLatestPriceList() {
    return new Promise((resolve, reject) => {
        let conn = mongoose.createConnection(mongoUri + config.database);
        let PriceModel = conn.model('Price', PriceSchema);
        PriceModel.find({})
            .then((results) => {
                if (results.length == 0) {
                    log.log('getting latest price list> EMPTY (PLEASE INIT FIRST)', 'SYSTEM');
                    reject(util.createCode(['price', 'data', 'empty']));
                } else {
                    resolve(results[results.length - 1]);
                }
            }).catch((err) => {
                log.log('getting latest price list', 'SYSTEM');
                log.log(err.message, 'error');
                reject(util.createCode(['undefined']));
            }).finally(() => {
                conn.close();
            });
    });
}
/**
 * 
 * @param {Object <PriceModel>} newPriceList -
 * @returns {Promise} -  code ['price','data','inserted','success'] | ['price','data','inserted','failure']
 */
function insertPriceList(newPriceList) {
    return new Promise((resolve, reject) => {
        let conn = mongoose.createConnection(mongoUri + config.database);
        let PriceModel = conn.model('Price', PriceSchema)
        PriceModel.updateOne({ date: newPriceList.date }, newPriceList)
            .then(() => {
                eventObj.emit('newPrice', newPriceList);
                log.log('new pricelist inserted', 'SYSTEM');
                resolve(util.createCode(['price', 'data', 'inserted', 'success']));
            }).catch((err) => {
                log.log('new pricelist inserted', 'SYSTEM');
                log.log(err, 'error');
                reject(util.createCode(['price', 'data', 'inserted', 'failure']));
            }).finally(() => {
                conn.close();
            });
    });
}

/**
 * 
 * @param {Number} length 
 * @returns {Promise} - code ['price', 'generating', 'success'] | code ['price', 'generating', 'failure']
 */

function priceGenerator(length = 365) {
    return new Promise((resolve, reject) => {
        if (systemStatus.isRunning) {
            return reject(util.createCode(['price', 'generating', 'failure']) + ' ' + util.createCode(['system', 'running']));
        } else if (systemStatus.isSimulating) {
            return reject(util.createCode(['price', 'generating', 'failure']) + ' ' + util.createCode(['system', 'simulating']));
        } else {
            const conn = mongoose.createConnection(mongoUri + config.database);
            conn.on('open', () => {
                conn.db.dropDatabase()
                    .then(async () => {
                        const PriceModel = conn.model('Price', PriceSchema);
                        let generatingDate = moment().subtract(length, 'd');
                        let records = [];
                        let priceList = {
                            date: generatingDate.format('yyyy-MM-DD'),
                            material: config.cost.basePriceList.raw.material,
                            paint: config.cost.basePriceList.raw.paint,
                            box: config.cost.basePriceList.raw.box,
                            toolReplace: config.cost.basePriceList.toolReplace,
                            labour: config.cost.basePriceList.labourCost,
                            sell: config.sell.baseSellPrice,
                        };
                        records.push(cloneDeep(priceList));
                        let isFluctuated = false;
                        generatingDate.subtract(1, 'day')
                        while (!(moment().isSame(generatingDate, 'day'))) {
                            let rate = Math.random();
                            if (rate <= config.generatingFluctuateRate) {
                                isFluctuated = true;
                                priceList.material = util.fluctuate(priceList.material, config.cost.fluctuateMaxPercentage.material);
                                // priceList.material += (priceList.material * util.rand(config.cost.fluctuateMaxPercentage.material) * (Math.round(Math.random()) ? 1 : -1));
                                priceList.material = util.round(priceList.material, 2);
                            }
                            rate = Math.random();
                            if (rate <= config.generatingFluctuateRate) {
                                isFluctuated = true;
                                priceList.paint = util.fluctuate(priceList.paint, config.cost.fluctuateMaxPercentage.paint);
                                // priceList.paint += (priceList.paint * util.rand(config.cost.fluctuateMaxPercentage.paint) * (Math.round(Math.random()) ? 1 : -1));
                                priceList.paint = util.round(priceList.paint, 2);
                            }

                            if (rate <= config.generatingFluctuateRate) {
                                isFluctuated = true;
                                // priceList.box += (priceList.box * util.rand(config.cost.fluctuateMaxPercentage.box) * (Math.round(Math.random()) ? 1 : -1));
                                priceList.box = util.fluctuate(priceList.box, config.cost.fluctuateMaxPercentage.box);
                                priceList.box = util.round(priceList.box, 2);
                            }

                            if (rate <= config.generatingFluctuateRate) {
                                isFluctuated = true;
                                priceList.toolReplace = util.fluctuate(priceList.toolReplace, config.cost.fluctuateMaxPercentage.toolReplace);
                                priceList.toolReplace = util.round(priceList.toolReplace, 2);
                            }
                            if (rate <= config.generatingFluctuateRate) {
                                isFluctuated = true;
                                priceList.labour = util.fluctuate(priceList.labour, config.cost.fluctuateMaxPercentage.labourCost);
                                priceList.labour = util.round(priceList.labour, 2);
                            }
                            if (rate <= config.generatingFluctuateRate) {
                                isFluctuated = true;
                                priceList.sell = util.fluctuate(priceList.sell, config.sell.fluctuateMaxPercentage);
                                priceList.sell = util.round(priceList.sell, 2);
                            }

                            if (isFluctuated) {
                                priceList.date = generatingDate.format('yyyy-MM-DD');


                                records.push(cloneDeep(priceList));
                                isFluctuated = false;
                            }
                            generatingDate.add(1, 'day');
                        }

                        try {
                            await PriceModel.insertMany(records);
                        } catch (error) {
                            log.log('inserting pricelist to price collection', 'SYSTEM');
                            log.log(error.message, 'error');
                            conn.close();
                            return reject(util.createCode(['price', 'generating', 'failure']) + ' ' + util.createCode(['undefined']))
                        }
                        log.log('price generated', 'SYSTEM');
                        resolve(util.createCode(['price', 'generating', 'success']))
                    })
                    .catch((e) => {
                        log.log('price generating>clearing old data (dropping price collection)', 'SYSTEM');
                        log.log(e.message, 'error');
                        reject(util.createCode(['price', 'generating', 'failure']))
                    })
                    .finally(() => {
                        conn.close();
                    });
            })
        }
    });
}


//#endregion
/**
 * 
 * @returns {NodeJS.Timer} 
 */


function priceGen() {
    let rate = Math.random();
    if (rate < config.simulatingFluctuateRate) {
        try {
            getLatestPriceList()
                .then((record) => {
                    let priceList = record.details.at(-1);
                    rate = Math.random();
                    if (rate <= 0.3) {
                        isFluctuated = true;
                        priceList.material = util.fluctuate(priceList.material, config.cost.fluctuateMaxPercentage.material);
                        priceList.material = util.round(priceList.material, 2);

                    }
                    rate = Math.random();
                    if (rate <= 0.3) {
                        priceList.paint = util.fluctuate(priceList.paint, config.cost.fluctuateMaxPercentage.paint);
                        priceList.paint = util.round(priceList.paint, 2);
                    }

                    if (rate <= 0.3) {
                        priceList.box = util.fluctuate(priceList.box, config.cost.fluctuateMaxPercentage.box);
                        priceList.box = util.round(priceList.box, 2);
                    }

                    if (rate <= 0.3) {
                        priceList.toolReplace = util.fluctuate(priceList.toolReplace, config.cost.fluctuateMaxPercentage.toolReplace);
                        priceList.toolReplace = util.round(priceList.toolReplace, 2);
                    }
                    if (rate <= 0.3) {
                        priceList.labour = util.fluctuate(priceList.labour, config.cost.fluctuateMaxPercentage.labour);
                        priceList.labour = util.round(priceList.labour, 2);
                    }
                    if (rate <= 0.3) {
                        priceList.sell = util.fluctuate(priceList.sell, config.sell.fluctuateMaxPercentage);
                        priceList.sell = util.round(priceList.sell, 2);
                    }
                    return insertPriceList(priceList);
                })
                .then((code) => {
                    log.log('price generating (manually)>inserted new price to collection', 'SYSTEM');
                })
                .catch((err) => {
                    log.log('price generating (manually)', 'SYSTEM');
                    log.log(err.message, 'error');
                });


        } catch (error) {
            log.log('price generating (manually)', 'SYSTEM');
            log.log(error.message, 'error');
        }
        return null;
    }
}
//#region Internal Support

//#endregion
downtimeEvent.on('newday', () => {
    priceGen();
})
module.exports = {
    getLatestPriceList,
    insertPriceList,
    priceGenerator,
    eventObj,
};
