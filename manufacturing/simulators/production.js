const { systemStatus } = require('../system/info');
const { sequenceInterval, production: config, downtime, mongoUri } = require('../config/config');
const util = require('../libs/util');
const mongoose = require('mongoose');
const _24HoursProductionSchema = require('../Schema/Production/_24HoursProduction');
const DailyProductionSchema = require('../Schema/Production/DailyProduction');

const moment = require('moment');
const DailyDowntimeSchema = require('../Schema/Downtime/DailyDowntime');
const DowntimeSchema = require('../Schema/Downtime/Downtime');

const MonthlyProductionSchema = require('../Schema/Production/MonthlyProduction');
const Event = require('events');
let eventObj = new Event();

const log = require('../../log');
//TimerID

let timerID_simulatingSequence = null;
let timerID_summarizingMonthly = null;
let timerID_summarizingDaily = null;

//#region export functions
/**
 * Start to simulate the production
 * @returns {code} -['production', 'simulating'] on success/ ['production', 'simulating', 'failure'] + reason on failure
 */
function productionSimulate() {
    if (systemStatus.isSimulating) {
        timerID_simulatingSequence = productionSimulatingSequence();
        timerID_summarizingDaily = setInterval(() => (dailySum()), sequenceInterval * 2);
        setTimeout(() => (timerID_summarizingMonthly = setInterval(() => (monthlySum()), sequenceInterval * 2)), 30000);
        log.log('production simulating', 'SYSTEM');
        return util.createCode(['production', 'simulating']);
    } else {
        log.log('production simulating fail > isSimulating == false (PLEASE FOLLOW THE SEQUENCE OF SIMULATING)', 'error');
        return util.createCode(['production', 'simulating', 'failure']) + ' ' + util.createCode(['downtime', 'simulating', 'notRunning']);
    }
}
/**
 * Stop the production simulating by clear the Timer
 * @returns  {code} -['production', 'simulating', 'ended'] /['operation', 'failure']
 */
function productionSimulating_Quit() {
    if (timerID_simulatingSequence) {
        clearInterval(timerID_simulatingSequence);
        timerID_simulatingSequence = null;
        clearInterval(timerID_summarizingMonthly);
        clearInterval(timerID_summarizingDaily);
        return util.createCode(['production', 'simulating', 'ended']);
    } else {
        return util.createCode(['operation', 'failure']) + util.createCode(['production', 'simulating', 'notRunning']);;
    }
}
/**
 * Generate production data with lenght
 * NB! Must be ran after generation of downtime data.
 * @param {number} length 
 * @returns {Promise}
 */
function productionGenerator(length = 365) {
    return new Promise((resolve, reject) => {
        if (systemStatus.isRunning) {
            return reject(util.createCode(['production', 'generating', 'failure']) + ' ' + util.createCode(['system', 'running']));
        } else if (systemStatus.isSimulating) {
            return reject(util.createCode(['production', 'generating', 'failure']) + ' ' + util.createCode(['system', 'simulating']));
        } else {
            const prodConn = mongoose.createConnection(mongoUri + config.database);
            const downConn = mongoose.createConnection(mongoUri + downtime.database);

            prodConn.on('open', () => {
                prodConn.db.dropDatabase()
                    .then(async () => {
                        try {
                            const DailyProductionModel = prodConn.model('DailyProduction', DailyProductionSchema);
                            const MonthlyProductionModel = prodConn.model('MonthlyProduction', MonthlyProductionSchema);
                            const DailyDowntimeModel = downConn.model('DailyDowntime', DailyDowntimeSchema);
                            const DowntimeModel = downConn.model('Downtime', DowntimeSchema);
                            const _24HoursProductionModel = prodConn.model('24HoursProduction', _24HoursProductionSchema);
                            let MonthlyRecord = {
                                productionTime: 0,
                                proccessA: {
                                    input: 0,
                                    firstFinished: 0,
                                    reworked: 0
                                },
                                proccessB: {
                                    input: 0,
                                    firstFinished: 0,
                                    reworked: 0
                                },
                                proccessC: {
                                    input: 0,
                                    firstFinished: 0,
                                    reworked: 0
                                },
                                output: 0,
                                performance: 0,
                                operatingTime: 0,
                            }
                            let DailyRecords = [];
                            let divider = 0;
                            while (length > 1) {
                                let generatingDate = moment().subtract(length, 'd');
                                const totalDowntimeInDate = await DailyDowntimeModel.where('date').equals(generatingDate.format('yyyy-MM-DD')).select('total');
                                if (totalDowntimeInDate.length !== 1) {
                                    throw `Production Generating - Get total downtime at ${generatingDate.format('yyyy-MM-DD')} receive ${totalDowntimeInDate.length} value(s)- Expected 1!`
                                }
                                let operatingTime = util._time._time('24:00').subtract(util._time._time(totalDowntimeInDate[0].total)).toMinnute();
                                const temp = await DowntimeModel.findOne({ date: generatingDate.format('yyyy-MM-DD') });
                                let productionTime;
                                if (temp) {
                                    productionTime = operatingTime - (temp.details.length) * util.rand(5);
                                } else {
                                    productionTime = operatingTime - util.rand(20, 5);
                                }

                                // let productionTime = util._time._time('24:00').subtract(util._time._time(totalDowntimeInDate[0].total)).toMinnute();


                                let totalInput = productionTime * config.inputPerMin;
                                let proccessA_ff = Math.round(totalInput * (1 - util.rand(config.maxDefectRate.proccessA)));
                                let proccessA_reworked = Math.round((totalInput - proccessA_ff) * Math.random());
                                let proccessB_input = proccessA_ff + proccessA_reworked;
                                let proccessB_ff = Math.round(proccessB_input * (1 - util.rand(config.maxDefectRate.proccessB)));
                                let proccessB_reworked = Math.round((proccessB_input - proccessB_ff) * Math.random());
                                let proccessC_input = proccessB_ff + proccessB_reworked;
                                let proccessC_ff = Math.round(proccessC_input * (1 - util.rand(config.maxDefectRate.proccessC)));
                                let proccessC_reworked = Math.round((proccessC_input - proccessC_ff) * Math.random());
                                let finishedProducts = proccessC_ff + proccessC_reworked;
                                let performance = util.rand(0.95, 0.5);

                                MonthlyRecord.productionTime += productionTime;
                                MonthlyRecord.proccessA.input += totalInput;
                                MonthlyRecord.proccessA.firstFinished += proccessA_ff;
                                MonthlyRecord.proccessA.reworked += proccessA_reworked;
                                MonthlyRecord.proccessB.input += proccessB_input;
                                MonthlyRecord.proccessB.firstFinished += proccessB_ff;
                                MonthlyRecord.proccessB.reworked += proccessB_reworked;
                                MonthlyRecord.proccessC.input += proccessC_input;
                                MonthlyRecord.proccessC.firstFinished += proccessC_ff;
                                MonthlyRecord.proccessC.reworked += proccessC_reworked;
                                MonthlyRecord.output += finishedProducts;
                                MonthlyRecord.operatingTime += operatingTime;
                                MonthlyRecord.performance += performance;
                                divider++;

                                let record = {
                                    date: generatingDate.format('yyyy-MM-DD'),
                                    productionTime,
                                    proccessA: {
                                        input: totalInput,
                                        firstFinished: proccessA_ff,
                                        reworked: proccessA_reworked,
                                    },
                                    proccessB: {
                                        input: proccessB_input,
                                        firstFinished: proccessB_ff,
                                        reworked: proccessB_reworked,
                                    },
                                    proccessC: {
                                        input: proccessC_input,
                                        firstFinished: proccessB_ff,
                                        reworked: proccessC_reworked,
                                    },
                                    output: finishedProducts,
                                    operatingTime,
                                    performance
                                }
                                DailyRecords.push(record);
                                // await DailyProductionModel.updateOne({ date: record.date }, record, { upsert: true });

                                if (length !== 2 && generatingDate.isSame(moment(generatingDate).endOf('month'), 'day')) {
                                    MonthlyRecord.date = generatingDate.format('yyyy-MMMM');
                                    MonthlyRecord.performance = MonthlyRecord.performance / divider;
                                    divider = 0;
                                    await MonthlyProductionModel.updateOne({ date: MonthlyRecord.date }, MonthlyRecord, { upsert: true });
                                    MonthlyRecord = {
                                        productionTime: 0,
                                        proccessA: {
                                            input: 0,
                                            firstFinished: 0,
                                            reworked: 0
                                        },
                                        proccessB: {
                                            input: 0,
                                            firstFinished: 0,
                                            reworked: 0
                                        },
                                        proccessC: {
                                            input: 0,
                                            firstFinished: 0,
                                            reworked: 0
                                        },
                                        output: 0,
                                        operatingTime: 0,
                                        performance: 0
                                    }
                                }
                                length--;
                            }
                            //#region 24Hours
                            let hhmm = moment().subtract(1, 'day');

                            let productionTime = util._time._time(hhmm).toMinnute();
                            let operatingTime = productionTime;

                            let totalInput = productionTime * config.inputPerMin;
                            let proccessA_ff = Math.round(totalInput * (1 - util.rand(config.maxDefectRate.proccessA)));
                            let proccessA_reworked = Math.round((totalInput - proccessA_ff) * Math.random());
                            let proccessB_input = proccessA_ff + proccessA_reworked;
                            let proccessB_ff = Math.round(proccessB_input * (1 - util.rand(config.maxDefectRate.proccessB)));
                            let proccessB_reworked = Math.round((proccessB_input - proccessB_ff) * Math.random());
                            let proccessC_input = proccessB_ff + proccessB_reworked;
                            let proccessC_ff = Math.round(proccessC_input * (1 - util.rand(config.maxDefectRate.proccessC)));
                            let proccessC_reworked = Math.round((proccessC_input - proccessC_ff) * Math.random());
                            let output = proccessC_ff + proccessC_reworked;
                            const yesterdayDowntimeRecord = await DowntimeModel.findOne({ date: moment().subtract(1, 'day').format('yyyy-MM-DD') });
                            let detailsCounter = [];
                            if (yesterdayDowntimeRecord) {
                                let counter = 0;
                                for (; counter < yesterdayDowntimeRecord.details.length; counter++) {
                                    if (util._time.evaluate(hhmm.format('HH:mm'), '<=', yesterdayDowntimeRecord.details[counter].end)) {
                                        detailsCounter.unshift(counter);
                                    }

                                }
                            }
                            let counter = detailsCounter.shift();
                            let _24HoursRecords = [];
                            while (!(hhmm.isSame(moment(), 'day'))) {
                                let newRecord = {
                                    time: hhmm.format('HH:mm'),
                                    proccessA: {
                                        input: 0,
                                        firstFinished: 0,
                                        reworked: 0
                                    },
                                    proccessB: {
                                        input: 0,
                                        firstFinished: 0,
                                        reworked: 0
                                    },
                                    proccessC: {
                                        input: 0,
                                        firstFinished: 0,
                                        reworked: 0
                                    }, output: 0
                                };
                                if (counter !== undefined) {
                                    if (util._time.evaluate(hhmm, '<', yesterdayDowntimeRecord.details[counter].start)) {
                                        newRecord.proccessA.input = config.inputPerMin;
                                        newRecord.proccessA.firstFinished = Math.round(newRecord.proccessA.input * (1 - util.rand(config.maxDefectRate.proccessA)));
                                        newRecord.proccessA.reworked = Math.round((newRecord.proccessA.input - newRecord.proccessA.firstFinished) * Math.random());
                                        newRecord.proccessB.input = newRecord.proccessA.firstFinished + newRecord.proccessA.reworked;
                                        newRecord.proccessB.firstFinished = Math.round(newRecord.proccessB.input * (1 - util.rand(config.maxDefectRate.proccessB)));
                                        newRecord.proccessB.reworked = Math.round((newRecord.proccessB.input - newRecord.proccessB.firstFinished) * Math.random());
                                        newRecord.proccessC.input = newRecord.proccessB.firstFinished + newRecord.proccessB.reworked;
                                        newRecord.proccessC.firstFinished = Math.round(newRecord.proccessC.input * (1 - util.rand(config.maxDefectRate.proccessC)));
                                        newRecord.proccessC.reworked = Math.round((newRecord.proccessC.input - newRecord.proccessC.firstFinished) * Math.random());
                                        newRecord.output = newRecord.proccessC.firstFinished + newRecord.proccessC.reworked;
                                        productionTime++;
                                        operatingTime++;
                                    } else if (util._time.evaluate(hhmm, '==', yesterdayDowntimeRecord.details[counter].end)) {
                                        newRecord.proccessA.input = config.inputPerMin;
                                        newRecord.proccessA.firstFinished = Math.round(newRecord.proccessA.input * (1 - util.rand(config.maxDefectRate.proccessA)));
                                        newRecord.proccessA.reworked = Math.round((newRecord.proccessA.input - newRecord.proccessA.firstFinished) * Math.random());
                                        newRecord.proccessB.input = newRecord.proccessA.firstFinished + newRecord.proccessA.reworked;
                                        newRecord.proccessB.firstFinished = Math.round(newRecord.proccessB.input * (1 - util.rand(config.maxDefectRate.proccessB)));
                                        newRecord.proccessB.reworked = Math.round((newRecord.proccessB.input - newRecord.proccessB.firstFinished) * Math.random());
                                        newRecord.proccessC.input = newRecord.proccessB.firstFinished + newRecord.proccessB.reworked;
                                        newRecord.proccessC.firstFinished = Math.round(newRecord.proccessC.input * (1 - util.rand(config.maxDefectRate.proccessC)));
                                        newRecord.proccessC.reworked = Math.round((newRecord.proccessC.input - newRecord.proccessC.firstFinished) * Math.random());
                                        newRecord.output = newRecord.proccessC.firstFinished + newRecord.proccessC.reworked;
                                        productionTime++;
                                        operatingTime++;
                                        counter = detailsCounter.shift();
                                    } else if (util._time.evaluate(hhmm, '>=', yesterdayDowntimeRecord.details[counter].start)) {
                                        newRecord.proccessA.input = 0;
                                        newRecord.proccessA.firstFinished = 0;
                                        newRecord.proccessA.reworked = 0;
                                        newRecord.proccessB.input = 0;
                                        newRecord.proccessB.firstFinished = 0;
                                        newRecord.proccessB.reworked = 0;
                                        newRecord.proccessC.input = 0;
                                        newRecord.proccessC.firstFinished = 0;
                                        newRecord.proccessC.reworked = 0;
                                        newRecord.output = 0;
                                        productionTime -= util.rand(3);
                                    }
                                } else {
                                    newRecord.proccessA.input = config.inputPerMin;
                                    newRecord.proccessA.firstFinished = Math.round(newRecord.proccessA.input * (1 - util.rand(config.maxDefectRate.proccessA)));
                                    newRecord.proccessA.reworked = Math.round((newRecord.proccessA.input - newRecord.proccessA.firstFinished) * Math.random());
                                    newRecord.proccessB.input = newRecord.proccessA.firstFinished + newRecord.proccessA.reworked;
                                    newRecord.proccessB.firstFinished = Math.round(newRecord.proccessB.input * (1 - util.rand(config.maxDefectRate.proccessB)));
                                    newRecord.proccessB.reworked = Math.round((newRecord.proccessB.input - newRecord.proccessB.firstFinished) * Math.random());
                                    newRecord.proccessC.input = newRecord.proccessB.firstFinished + newRecord.proccessB.reworked;
                                    newRecord.proccessC.firstFinished = Math.round(newRecord.proccessC.input * (1 - util.rand(config.maxDefectRate.proccessC)));
                                    newRecord.proccessC.reworked = Math.round((newRecord.proccessC.input - newRecord.proccessC.firstFinished) * Math.random());
                                    newRecord.output = newRecord.proccessC.firstFinished + newRecord.proccessC.reworked;
                                    operatingTime++;
                                    productionTime++;
                                }
                                totalInput += newRecord.proccessA.input;
                                proccessA_ff += newRecord.proccessA.firstFinished;
                                proccessA_reworked += newRecord.proccessA.reworked;
                                proccessB_input += newRecord.proccessB.input;
                                proccessB_ff += newRecord.proccessB.firstFinished;
                                proccessB_reworked += newRecord.proccessB.reworked;
                                proccessC_input += newRecord.proccessC.input;
                                proccessC_ff += newRecord.proccessC.firstFinished;
                                proccessC_reworked += newRecord.proccessC.reworked;
                                output += newRecord.output;
                                _24HoursRecords.push(newRecord);
                                hhmm.add(1, 'minute');
                            }
                            let performance = util.rand(0.95, 0.5);
                            // productionTime += (+((productionTimeInMinute / 60).toFixed(5)));
                            let record = {
                                date: moment(hhmm).subtract(1, 'day').format('yyyy-MM-DD'),
                                productionTime,
                                proccessA: {
                                    input: totalInput,
                                    firstFinished: proccessA_ff,
                                    reworked: proccessA_reworked,
                                },
                                proccessB: {
                                    input: proccessB_input,
                                    firstFinished: proccessB_ff,
                                    reworked: proccessB_reworked,
                                },
                                proccessC: {
                                    input: proccessC_input,
                                    firstFinished: proccessB_ff,
                                    reworked: proccessC_reworked,
                                },
                                output: output,
                                operatingTime,
                                performance,
                            }
                            DailyRecords.push(record);
                            MonthlyRecord.productionTime += productionTime;
                            MonthlyRecord.proccessA.input += totalInput;
                            MonthlyRecord.proccessA.firstFinished += proccessA_ff;
                            MonthlyRecord.proccessA.reworked += proccessA_reworked;
                            MonthlyRecord.proccessB.input += proccessB_input;
                            MonthlyRecord.proccessB.firstFinished += proccessB_ff;
                            MonthlyRecord.proccessB.reworked += proccessB_reworked;
                            MonthlyRecord.proccessC.input += proccessC_input;
                            MonthlyRecord.proccessC.firstFinished += proccessC_ff;
                            MonthlyRecord.proccessC.reworked += proccessC_reworked;
                            MonthlyRecord.output += output;
                            MonthlyRecord.operatingTime += operatingTime;
                            MonthlyRecord.performance += performance;
                            productionTimeInMinute = 0;
                            while (!(hhmm.isAfter(moment().subtract(1, 'minute'), 'minute'))) {
                                let newRecord = {
                                    time: hhmm.format('HH:mm'),
                                    proccessA: {
                                        input: 0,
                                        firstFinished: 0,
                                        reworked: 0
                                    },
                                    proccessB: {
                                        input: 0,
                                        firstFinished: 0,
                                        reworked: 0
                                    },
                                    proccessC: {
                                        input: 0,
                                        firstFinished: 0,
                                        reworked: 0
                                    }, output: 0
                                };
                                newRecord.proccessA.input = config.inputPerMin;
                                newRecord.proccessA.firstFinished = Math.round(newRecord.proccessA.input * (1 - util.rand(config.maxDefectRate.proccessA)));
                                newRecord.proccessA.reworked = Math.round((newRecord.proccessA.input - newRecord.proccessA.firstFinished) * Math.random());
                                newRecord.proccessB.input = newRecord.proccessA.firstFinished + newRecord.proccessA.reworked;
                                newRecord.proccessB.firstFinished = Math.round(newRecord.proccessB.input * (1 - util.rand(config.maxDefectRate.proccessB)));
                                newRecord.proccessB.reworked = Math.round((newRecord.proccessB.input - newRecord.proccessB.firstFinished) * Math.random());
                                newRecord.proccessC.input = newRecord.proccessB.firstFinished + newRecord.proccessB.reworked;
                                newRecord.proccessC.firstFinished = Math.round(newRecord.proccessC.input * (1 - util.rand(config.maxDefectRate.proccessC)));
                                newRecord.proccessC.reworked = Math.round((newRecord.proccessC.input - newRecord.proccessC.firstFinished) * Math.random());
                                newRecord.output = newRecord.proccessC.firstFinished + newRecord.proccessC.reworked;
                                productionTime++;
                                operatingTime++;
                                MonthlyRecord.proccessA.input += newRecord.proccessA.input;
                                MonthlyRecord.proccessA.firstFinished += newRecord.proccessA.firstFinished;
                                MonthlyRecord.proccessA.reworked += newRecord.proccessA.reworked;
                                MonthlyRecord.proccessB.input += newRecord.proccessB.input;
                                MonthlyRecord.proccessB.firstFinished += newRecord.proccessB.firstFinished;
                                MonthlyRecord.proccessB.reworked += newRecord.proccessB.reworked;
                                MonthlyRecord.proccessC.input += newRecord.proccessC.input;
                                MonthlyRecord.proccessC.firstFinished += newRecord.proccessC.firstFinished;
                                MonthlyRecord.proccessC.reworked += newRecord.proccessC.reworked;
                                MonthlyRecord.output += newRecord.output;
                                _24HoursRecords.push(newRecord);
                                // await _24HoursProductionModel.updateOne({ time: newRecord.time }, newRecord, { upsert: true });
                                hhmm.add(1, 'minute');
                            }
                            MonthlyRecord.operatingTime += operatingTime;
                            MonthlyRecord.productionTime += productionTime;
                            MonthlyRecord.date = hhmm.format('yyyy-MMMM');
                            MonthlyRecord.performance = MonthlyRecord.performance / (divider + 1);
                            await _24HoursProductionModel.insertMany(_24HoursRecords);
                            await DailyProductionModel.insertMany(DailyRecords);
                            await MonthlyProductionModel.updateOne({ date: MonthlyRecord.date }, MonthlyRecord, { upsert: true });

                            //#endregion 

                            //Monthly


                        }
                        catch (e) {
                            log.log('production generating', 'SYSTEM');
                            log.log(e.message, 'error');
                            prodConn.close();
                            downConn.close();
                            return reject(util.createCode(['production', 'generating', 'failure']) + ' ' + util.createCode(['undefined']));
                        }
                        resolve(util.createCode(['production', 'generating', 'success']));
                        log.log('production generated', 'SYSTEM');
                    })
                    .catch((e) => {
                        log.log('production generating>clearing old data (dropping database)', 'SYSTEM');
                        log.log(e.message, 'error');
                        reject(util.createCode(['production', 'generating', 'failure']) + ' ' + util.createCode(['undefined']));
                    })
                    .finally(() => {
                        prodConn.close();
                        downConn.close();
                    });
            });
        };
    });
}
/**
 * Function that help to summarize the downtime in a single montg that has been passed in.
 * @param {string} [dateStr] -month that will be summarized! NB! format : yyyy-MM-DD
 * @returns {Promise} - resolve with actionCode
 */
function monthlySum(dateStr = null) {
    return new Promise(async (resolve, reject) => {
        if (dateStr == null) {
            dateStr = moment().format('yyyy-MM-DD')
        }
        const conn = mongoose.createConnection(mongoUri + config.database);
        const DailyProductionModel = conn.model('DailyProduction', DailyProductionSchema);
        const MonthlyProductionModel = conn.model('MonthlyProduction', MonthlyProductionSchema);
        let evaluatingDate = moment(dateStr, 'yyyy-MM-DD').startOf('month');
        const endDate = moment(dateStr, 'yyyy-MM-DD').isSameOrAfter(moment(), 'day') ? moment() : moment(dateStr, 'yyyy-MM-DD').endOf('month');
        // const endDate = moment().i(moment(dateStr, 'yyyy-MM-DD', 'day')) ? moment(dateStr, 'yyyy-MM-DD').endOf('month') : moment();

        let monthlyRecord = {
            date: moment().format('yyyy-MMMM'),
            productionTime: 0,
            proccessA: {
                input: 0,
                firstFinished: 0,
                reworked: 0
            },
            proccessB: {
                input: 0,
                firstFinished: 0,
                reworked: 0
            },
            proccessC: {
                input: 0,
                firstFinished: 0,
                reworked: 0
            },
            output: 0,
            performance: 0,
            operatingTime: 0,
        };
        try {
            let divider = 0;
            do {
                try {
                    const dailyRecord = await DailyProductionModel.findOne({ date: evaluatingDate.format('yyyy-MM-DD') });
                    monthlyRecord.proccessA.input += dailyRecord.proccessA.input;
                    monthlyRecord.proccessA.firstFinished += dailyRecord.proccessA.firstFinished;
                    monthlyRecord.proccessA.reworked += dailyRecord.proccessA.reworked;
                    monthlyRecord.proccessB.input += dailyRecord.proccessB.input;
                    monthlyRecord.proccessB.firstFinished += dailyRecord.proccessB.firstFinished;
                    monthlyRecord.proccessB.reworked += dailyRecord.proccessB.reworked;
                    monthlyRecord.proccessC.input += dailyRecord.proccessC.input;
                    monthlyRecord.proccessC.firstFinished += dailyRecord.proccessC.firstFinished;
                    monthlyRecord.proccessC.reworked += dailyRecord.proccessC.reworked;
                    monthlyRecord.output += dailyRecord.output;
                    monthlyRecord.productionTime += dailyRecord.productionTime;
                    monthlyRecord.operatingTime += dailyRecord.operatingTime;
                    monthlyRecord.performance += dailyRecord.performance;
                    divider++;
                    evaluatingDate.add(1, 'day');
                } catch (e) {
                    log.log('summarizing monthly production>iterating daily production collection', 'SYSTEM');
                    log.log(evaluatingDate.format('yyyy-MM-DD'), 'detail');
                    log.log(e.message, 'error');
                }


            } while (!(evaluatingDate.isAfter(endDate, 'day')));
            monthlyRecord.performance = monthlyRecord.performance / divider;
            await MonthlyProductionModel.updateOne({ date: monthlyRecord.date }, monthlyRecord, { upsert: true });
            resolve(util.createCode(['production', 'monthly', 'summarizing', 'success']));
            eventObj.emit('monthlyUpdated', monthlyRecord);
        } catch (error) {
            // console.log(error);
            log.log('summarizing monthly production>updating monthly production collection', 'SYSTEM');
            log.log(error.message, 'error');
            reject(util.createCode(['production', 'monthly', 'summarizing', 'failure']));
        }

        conn.close();
    });
}

/**
 * Function that help to summarize the downtime in a single day that has been passed in.
 * @returns {Promise} - resolve with actionCode
 */
function dailySum() {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + config.database);
        try {
            const DailyProductionModel = conn.model('DailyProduction', DailyProductionSchema);
            const _24HoursProductionModel = conn.model('24HoursProduction', _24HoursProductionSchema);
            let dailyRecord = await DailyProductionModel.findOne({ date: moment().format('yyyy-MM-DD') });
            if (dailyRecord === null) {
                dailyRecord = {
                    date: moment().format('yyyy-MM-DD'),
                    productionTime: 0,
                    proccessA: {
                        input: 0,
                        firstFinished: 0,
                        reworked: 0
                    },
                    proccessB: {
                        input: 0,
                        firstFinished: 0,
                        reworked: 0
                    },
                    proccessC: {
                        input: 0,
                        firstFinished: 0,
                        reworked: 0
                    },
                    output: 0,
                    operatingTime: 0,
                    performance: 0,
                    updateTime: "00:00"
                };
            }
            if (dailyRecord.updateTime != moment().format('HH:mm')) {
                const myArr = await _24HoursProductionModel.find({});

                // if (myArr.length !== 1440) {

                //     throw '24HoursProductionCollection is invalid!';
                // }
                let counter = myArr.findIndex((e) => {
                    return e.time === dailyRecord.updateTime

                });
                if (counter === -1) {

                    throw `Unable to find record with time ${dailyRecord.updateTime} in 24HoursProduction`;
                }
                let temp = [0, 0];
                for (; counter < myArr.length; counter++) {
                    if (myArr[counter].proccessA.input !== 0) {
                        if (temp[0] === temp[1]) {
                            temp[0]++;
                        }
                        dailyRecord.proccessA.input += myArr[counter].proccessA.input;
                        dailyRecord.proccessA.firstFinished += myArr[counter].proccessA.firstFinished;
                        dailyRecord.proccessA.reworked += myArr[counter].proccessA.reworked;
                        dailyRecord.proccessB.input += myArr[counter].proccessB.input;
                        dailyRecord.proccessB.firstFinished += myArr[counter].proccessB.firstFinished;
                        dailyRecord.proccessB.reworked += myArr[counter].proccessB.reworked;
                        dailyRecord.proccessC.input += myArr[counter].proccessC.input;
                        dailyRecord.proccessC.firstFinished += myArr[counter].proccessC.firstFinished;
                        dailyRecord.proccessC.reworked += myArr[counter].proccessC.reworked;
                        dailyRecord.output += myArr[counter].output;
                        dailyRecord.productionTime++;
                        dailyRecord.operatingTime++;
                    } else {
                        if (temp[0] !== temp[1]) {
                            temp[1]++;
                        }
                    }
                }
                dailyRecord.productionTime -= temp[0] * util.rand(2, 0);
                if (dailyRecord.performance === 0) {
                    dailyRecord.performance = util.rand(0.7, 0.95);
                } else {
                    dailyRecord.performance = util.fluctuate(dailyRecord.performance, 0.05, 0.456);
                }
                dailyRecord.updateTime = moment().format('HH:mm');
                await DailyProductionModel.updateOne({ date: dailyRecord.date }, dailyRecord, { upsert: true });
                eventObj.emit('dailyUpdated', dailyRecord);

            }
            resolve(util.createCode(['production', 'daily', 'summarizing', 'success']));
        } catch (error) {
            log.log('summarizing daily production', "SYSTEM");
            log.log(error.message, "error");
            reject(util.createCode(['production', 'daily', 'summarizing', 'failure']));
        }
        conn.close();
    })
}
//#endregion


//#region internal support functions
/**
 * Steps to simulate the production every minute,
 * @returns {NodeJS.Timer} can be used to stop the sequence.
 */
function productionSimulatingSequence() {
    return setInterval(() => {
        const connection = mongoose.createConnection(mongoUri + config.database);
        const _24HoursProductionModel = connection.model('24HoursProduction', _24HoursProductionSchema);
        let newRecord = {
            time: moment().format('HH:mm'),
            proccessA: {
                input: 0,
                firstFinished: 0,
                reworked: 0
            },
            proccessB: {
                input: 0,
                firstFinished: 0,
                reworked: 0
            },
            proccessC: {
                input: 0,
                firstFinished: 0,
                reworked: 0
            },
            output: 0

        };
        if (systemStatus.isRunning) {
            newRecord.proccessA.input = config.inputPerMin;
            newRecord.proccessA.firstFinished = Math.round(newRecord.proccessA.input * (1 - util.rand(config.maxDefectRate.proccessA)));
            newRecord.proccessA.reworked = Math.round((newRecord.proccessA.input - newRecord.proccessA.firstFinished) * Math.random());
            newRecord.proccessB.input = newRecord.proccessA.firstFinished + newRecord.proccessA.reworked;
            newRecord.proccessB.firstFinished = Math.round(newRecord.proccessB.input * (1 - util.rand(config.maxDefectRate.proccessB)));
            newRecord.proccessB.reworked = Math.round((newRecord.proccessB.input - newRecord.proccessB.firstFinished) * Math.random());
            newRecord.proccessC.input = newRecord.proccessB.firstFinished + newRecord.proccessB.reworked;
            newRecord.proccessC.firstFinished = Math.round(newRecord.proccessC.input * (1 - util.rand(config.maxDefectRate.proccessC)));
            newRecord.proccessC.reworked = Math.round((newRecord.proccessC.input - newRecord.proccessC.firstFinished) * Math.random());
            newRecord.output = newRecord.proccessC.firstFinished + newRecord.proccessC.reworked;
        };
        _24HoursProductionModel.deleteOne({ time: newRecord.time })
            .then((result) => {
                return _24HoursProductionModel.updateOne({ time: newRecord.time }, newRecord, { upsert: true });
            }).then(() => {
                eventObj.emit('24HoursUpdated', newRecord);
            })
            .catch((err) => {
                log.log('Simulating production', 'SYSTEM');
                log.log(err.message, 'error');
            }).finally(() => {
                connection.close();
            })

    }, sequenceInterval)
}

//#endregion


module.exports = {
    productionSimulate,
    productionSimulating_Quit,
    productionGenerator,
    monthlySum,
    dailySum,
    eventObj
};
