const { systemStatus } = require('../system/info');
const { sequenceInterval, downtime: config, downReasons, mongoUri } = require('../config/config');
const util = require('../libs/util');
const mongoose = require('mongoose');
const DowntimeSchema = require('../Schema/Downtime/Downtime');
const DailyDowntimeSchema = require('../Schema/Downtime/DailyDowntime');
const moment = require('moment');
const MonthlyDowntimeSchema = require('../Schema/Downtime/MonthlyDowntime');
const { log } = require('../../log');
const UserSchema = require('../../models/Schema/Users');
const Notification = require('../../models/Schema/Notification');
const Event = require('events');
const NotificationSchema = require('../../models/Schema/Notification');
let eventObj = new Event();
//Timer ID
const userDB = "dashboard";
let timerID_waitingNewDay;
let timerID_simulatingSequence;
// Const
//#region export functions
/**
 * Function that simulate a system in real time. 
 * Every 60s, the function will randomly turns the system off, on or do nothing, depends on the rate.
 */
async function downtimeSimulate() {
    log('Simulators Starting..', 'SYSTEM');
    systemStatus.isSimulating = true;

    const conn = mongoose.createConnection(mongoUri + config.database);
    const DowntimeModel = conn.model('Downtime', DowntimeSchema);
    let record = null;
    let latestDayOnRecord = moment();
    while (record === null) {
        record = await DowntimeModel.findOne({ date: latestDayOnRecord.format('yyyy-MM-DD') });
        latestDayOnRecord.subtract(1, 'day');
    }
    const lastDetail = record.details.at(-1);
    if (lastDetail.end !== undefined) {
        systemStatus.isRunning = true;
    } else {
        systemStatus.isRunning = false;
    }
    log('Simulators is Running', 'SYSTEM');
    timerID_simulatingSequence = downtimeSimulatingSequence();
    eventObj.emit('statusChange');
    return util.createCode(['downtime', 'simulating']);
}
/**
 * function that stop the simulator
 * @returns actionCode
 */
function downtimeSimulating_Quit() {
    clearInterval(timerID_simulatingSequence);
    systemStatus.isSimulating = false;
    log('simulator ended', 'SYSTEM');

    return util.createCode(['downtime', 'simulating', 'ended']);
}
/**
 * Generate information about downtime for developing and testing, this function must not be used in actual running
 * @param {number} [length=365] - a countdown number to generate since today(running day).
 * @returns {Promise} - resolve with actionCode
 */
function downtimeGenerator(length = 365) {
    return new Promise((resolve, reject) => {
        if (systemStatus.isRunning) {
            reject(util.createCode(['downtime', 'generating', 'failure']) + ' ' + util.createCode(['system', 'running']));
            return;
        } else if (systemStatus.isSimulating) {
            reject(util.createCode(['downtime', 'generating', 'failure']) + ' ' + util.createCode(['system', 'simulating']));
            return;
        } else {
            const conn = mongoose.createConnection(mongoUri + config.database);
            conn.on('open', () => {
                conn.db.dropDatabase()
                    .then(async () => {
                        const DailyDowntimeModel = conn.model('DailyDowntime', DailyDowntimeSchema);
                        const MonthlyDowntimeModel = conn.model('MonthlyDowntime', MonthlyDowntimeSchema);
                        const DowntimeModel = conn.model('Downtime', DowntimeSchema);
                        let MonthlyRecord = {
                            service: '00:00',
                            brokenMachine: '00:00',
                            other: '00:00',
                            uncategozied: '00:00',
                        }
                        while (length > 0) {
                            let dateStr = moment().subtract(length, 'd').format('yyyy-MM-DD');
                            /**
                             * Ticket is a single piece of info that contains info related to 
                             */
                            let tickets = [];
                            let record = {
                                date: dateStr,
                                service: '00:00',
                                brokenMachine: '00:00',
                                other: '00:00',
                                uncategozied: '00:00',
                            };
                            while (Math.random() < config.generatingRate) {
                                if (tickets.length == 0) {
                                    tickets.push(downtime_detail_Generate(util._time._time('00:00')));
                                } else {
                                    tickets.push(downtime_detail_Generate(util._time._time(tickets.at(-1)['end'])));
                                }
                                if (util._time._time(tickets.at(-1).end).hh >= 21) {
                                    //If the current time is after 21:00,no more tick will be created
                                    break;
                                }
                            }
                            try {
                                if (tickets.length !== 0) {
                                    await DowntimeModel.create({
                                        date: dateStr,
                                        details: tickets
                                    });
                                    tickets.forEach(t => {
                                        record[t.reason] = util._time._time(record[t.reason]).add(util._time._time(t.duration)).toStr();
                                    });
                                    MonthlyRecord.service = util._time._time(MonthlyRecord.service).add(util._time._time(record.service)).toStr();
                                    MonthlyRecord.brokenMachine = util._time._time(MonthlyRecord.brokenMachine).add(util._time._time(record.brokenMachine)).toStr();
                                    MonthlyRecord.other = util._time._time(MonthlyRecord.other).add(util._time._time(record.other)).toStr();
                                    MonthlyRecord.uncategozied = util._time._time(MonthlyRecord.uncategozied).add(util._time._time(record.uncategozied)).toStr();
                                }
                                await DailyDowntimeModel.create(record);
                                if (moment().subtract(length, 'd').isSame(moment().subtract(length, 'd').endOf('month'), 'day') || length === 1) {
                                    MonthlyRecord.date = moment().subtract(length, 'd').format('yyyy-MMMM');
                                    await MonthlyDowntimeModel.create(MonthlyRecord);
                                    MonthlyRecord = {
                                        service: '00:00',
                                        brokenMachine: '00:00',
                                        other: '00:00',
                                        uncategozied: '00:00',
                                    }
                                }
                            } catch (err) {
                                log(err.message, 'error');
                                reject(util.createCode(['downtime', 'generating', 'failure']) + ' ' + util.createCode(['undefined']));
                                conn.close();
                                return;
                            }
                            length--;
                        }
                        resolve(util.createCode(['downtime', 'generating', 'success']));
                        log('downtime generated', 'operation');
                    })
                    .catch((e) => {
                        log(e.message, 'error');
                        reject(util.createCode(['downtime', 'generating', 'failure']) + ' ' + util.createCode(['undefined']));
                    })
                    .finally(() => {
                        conn.close();
                    });
            });

        }
    })
}
/**
 * Turn on the system
 * @param {string} [_operatorId] which is User ID
 * @param {string} [_reason ]
 * @returns {Promise} - resolve with actionCode
 */
function turnOnSystem(_operatorId = null, _reason = '') {
    return new Promise(async (res, rej) => {
        const conn = mongoose.createConnection(mongoUri + config.database);
        const conn2 = mongoose.createConnection(mongoUri + userDB);
        try {
            const DowntimeModel = conn.model('Downtime', DowntimeSchema);
            const User = conn2.model('User', UserSchema);
            const Notification = conn2.model("Notification", NotificationSchema);
            const now = moment();
            systemStatus.isRunning = true;
            const end = now.format('HH:mm');
            let reason;
            if (systemStatus.overnightProcedureRequired) {
                systemStatus.overnightProcedureRequired = false;
                let lastRecord = null;
                let lastDate = moment(now);
                while (lastRecord === null) {
                    lastDate.subtract(1, 'day');
                    lastRecord = await DowntimeModel.findOne({ date: lastDate.format('yyyy-MM-DD') });
                }
                reason = lastDate.details.at(-1).reason;
            }
            else {
                reason = _reason === '' ? downReasons[util.rand(downReasons.length)] : _reason;
            }

            const record = await DowntimeModel.findOne({ date: now.format('yyyy-MM-DD') });
            record.details.at(-1).reason = reason;
            record.details.at(-1).end = '';
            record.details.at(-1).end = end;
            record.details.at(-1).duration = util._time._time(end).subtract(util._time._time(record.details.at(-1).start)).toStr();

            if (_operatorId !== null) {
                record.details.at(-1).by = _operatorId;
            }

            await record.save();


            //notifications

            let by;
            if (_operatorId !== null) {
                by = _operatorId;
            } else {
                by = await User.findOne({ username: "admin" });
                if (by === null) {
                    by = await User.findOne({ username: "undefined" });
                }
                by = by._id;
            }

            let newNotification = await Notification.create({
                msgType: "info",
                msg: 'Manufacturing system turned on!',
                by,
            });

            await User.updateMany({}, {
                $push: {
                    notifications: { notificationID: newNotification._id }
                }
            });
            eventObj.emit('systemOnline', moment().format('MMMM DD,yyyy \t|\t HH:mm'));
            res(util.createCode(['system', 'turnOn', 'success']));
        } catch (error) {
            log('turning on fail', 'operation');
            log(error.message, 'error');
            rej(util.createCode(['system', 'turnOn', 'failure']));
        }
        conn.close();
        conn2.close();
    })
}
/**
 * 
 * @param {string} [_operatorId] - User ID 
 * @returns {Promise} - resolve with actionCode
 */
function turnOffSystem(_operatorId = null) {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + config.database);
        const conn2 = mongoose.createConnection(mongoUri + userDB);
        try {
            systemStatus.isRunning = false;
            const DowntimeModel = conn.model('Downtime', DowntimeSchema);
            const User = conn2.model('User', UserSchema);
            const Notification = conn2.model("Notification", NotificationSchema);
            let now = moment();
            const detail = {};
            if (_operatorId !== null) {
                detail.by = _operatorId;
            }
            detail.start = now.format('HH:mm');
            let record = await DowntimeModel.findOne({ date: now.format('yyyy-MM-DD') });
            if (record === null) {
                record = new DowntimeModel({ date: now.format('yyyy-MM-DD') });
            }
            record.details.push(detail);
            await record.save();

            let by;
            if (_operatorId !== null) {
                by = _operatorId;
            } else {
                by = await User.findOne({ username: "admin" });
                if (by === null) {
                    by = await User.findOne({ username: "undefined" });
                }
                by = by._id;
            }
            let newNotification = await Notification.create({
                msgType: "info",
                msg: 'Manufacturing system turned off!',
                by,
            });

            await User.updateMany({}, {
                $push: {
                    notifications: { notificationID: newNotification._id }
                }
            });

            eventObj.emit('systemOffline', moment().format('MMMM DD,yyyy \t|\t HH:mm'));
            resolve(util.createCode(['system', 'turnOff', 'success']));
        } catch (e) {
            log('tunring off fail', 'operation');
            log(e.message, 'error');

            reject(util.createCode(['system', 'turnOff', 'failure']));
        }
        conn.close();
        conn2.close();
    })
}
/**
 * Function that help to summarize the downtime in a single month that has been passed in.
 * @param {string} [dateStr] -date that will be summarized! (yyyy-MM-DD)
 * @returns {Promise} - resolve with actionCode
 */
function monthlySum(dateStr = null) {
    return new Promise(async (res, rej) => {
        if (dateStr == null) {
            dateStr = moment().format('yyyy-MM-DD')
        }
        const conn = mongoose.createConnection(mongoUri + config.database);
        const MonthlyDowntimeModel = conn.model('MonthlyDowntime', MonthlyDowntimeSchema);
        const DailyDowntimeModel = conn.model('DailyDowntime', DailyDowntimeSchema);
        let evaluatingDate = moment(dateStr, 'yyyy-MM-DD').startOf('month');
        const endDate = moment().isAfter(moment(dateStr, 'yyyy-MM-DD', 'day')) ? moment(dateStr, 'yyyy-MM-DD').endOf('month') : moment();
        let record = {
            service: '00:00',
            brokenMachine: '00:00',
            other: '00:00',
            uncategozied: '00:00'
        };
        try {
            do {
                const result = await DailyDowntimeModel.findOne({ date: evaluatingDate.format('yyyy-MM-DD') });
                if (result) {
                    record.service = util._time._time(record.service).add(util._time._time(result.service)).toStr();
                    record.brokenMachine = util._time._time(record.brokenMachine).add(util._time._time(result.brokenMachine)).toStr();
                    record.other = util._time._time(record.other).add(util._time._time(result.other)).toStr();
                    record.uncategozied = util._time._time(record.uncategozied).add(util._time._time(result.uncategozied)).toStr();
                }
                evaluatingDate.add(1, 'day');
            } while (!(evaluatingDate.isAfter(endDate)));
            await MonthlyDowntimeModel.updateOne({ date: endDate.format('yyyy-MMMM') }, record, { upsert: true });

            res(util.createCode(['downtime', 'monthly', 'summarizing', 'success']));
        } catch (e) {
            log('summarizing monthy downtime data fail', 'operation');
            log(e.message, 'error');
            rej(util.createCode(['downtime', 'monthly', 'summarizing', 'failure']))
        }
        conn.close();
    })


}
/**
 * Function that help to summarize the downtime in a single day that has been passed in.
 * @param {string} [dateStr] -date that will be summarized!(yyyy-MM-DD)
 * @returns {Promise} - resolve with actionCode
 */
function dailySum(dateStr = null) {
    return new Promise(async (resolve, reject) => {
        if (dateStr == null) {
            dateStr = moment().format('yyyy-MM-DD');
        }
        const conn = mongoose.createConnection(mongoUri + config.database);
        try {

            const DailyDowntimeModel = conn.model('DailyDowntime', DailyDowntimeSchema);
            const DowntimeModel = conn.model('Downtime', DowntimeSchema);
            let record = {
                date: dateStr,
                service: '00:00',
                brokenMachine: '00:00',
                other: '00:00',
                uncategozied: '00:00'
            };
            const result = await DowntimeModel.findOne({ date: dateStr });
            if (result !== null) {
                result.details.forEach(item => {
                    if (item.duration !== undefined) {
                        record[item.reason] = util._time._time(record[item.reason]).add(util._time._time(item.duration)).toStr();
                    } else {
                        record[item.reason] = util._time._time(record[item.reason]).add(util._time._time(moment().format('HH:mm')).subtract(util._time._time(item.start))).toStr();
                    }
                });
            }
            await DailyDowntimeModel.updateOne({ date: dateStr }, record, { upsert: true });

            resolve(util.createCode(['downtime', 'daily', 'summarizing', 'success']));
        } catch (error) {
            log('daily monthy downtime data fail', 'operation');
            log(error.message, 'error');
            reject(util.createCode(['downtime', 'daily', 'summarizing', 'failure']))
        }
        conn.close();
    })

}

//#endregion


//#region internal support functions

/**
 * The steps that must be done during a simulation of downtime.
 * This sequence will be repeat every systemStatus.systemStatus.sequenceInterval
 */
function downtimeSimulatingSequence() {
    return setInterval(() => {
        if (moment().hour() == 0 && moment().minute() == 1) {
            eventObj.emit('newday');
        }
        let rate = Math.random();

        if (rate < config.offRate && systemStatus.isRunning) {
            log('System is offline', 'SYSTEM');
            turnOffSystem().then().catch(error => { log('downtime simulating sequecen>turning off', 'SYSTEM'); log(error.message, 'error') });
        }
        else if (rate < config.onRate && !systemStatus.isRunning) {
            turnOnSystem().then().catch(error => { log('downtime simulating sequecen>turning on', 'SYSTEM'); log(error.message, 'error') });
            log('System is online', 'SYSTEM');
        }

        if (!systemStatus.isRunning && moment().hour() == 23 && moment().minute() > 57) {
            turnOnSystem().then().catch(error => { log('downtime simulating sequecen>overnight ', 'SYSTEM'); log(error.message, 'error') });
            systemStatus.overnightProcedureRequired = true;
            downtimeSimulating_Quit();
            //modify the ending time to 23:59
            const conn = mongoose.createConnection(mongoUri + config.database);
            const DowntimeModel = conn.model('Downtime', DowntimeSchema);
            DowntimeModel.findOne({ date: moment().format('yyyy-MM-DD') })
                .then((result) => {
                    result.details.at(-1).end = "23:59";
                    return result.save();
                })
                .then(() => {
                    return dailySum();
                })
                .then(() => {
                    return monthlySum();
                })
                .then(() => {
                    conn.close();
                })
                .catch((err) => {
                    log('downtime simulating sequecen>overnight>modifying endtime to 23:59>', 'SYSTEM');
                    log(err.message, 'error');
                });

            timerID_waitingNewDay = waitingNewDay();
            log('awaiting overnight procedure ', 'SYSTEM');


        }
    }, sequenceInterval);
}
/**
 * Waiting for 00:00 to start the simulator and 
 * This sequence will be repeat every 1s
 * @returns Timer
 */
function waitingNewDay() {
    return setInterval(() => {
        if (moment().hour() == 0) {
            turnOffSystem();
            log('restart simulators (over-night sequence)', 'SYSTEM');

            downtimeSimulate();
            clearInterval(timerID_waitingNewDay);
        }
    }, 1000);
}


/**
 * @param {mongoose.Connection} conn - mongoose connection
 * @param {string} collectionName 
 * @returns true if collectionName exists, vice versa
 */
function collectionExist(collectionName, conn) {
    conn.db.listCollections({ name: collectionName })
        .next(function (err, collinfo) {
            if (collinfo) {
                return true;
            } else {
                return false;
            }
        });
}

// Tickets: Every cycle of turning on-off system creates a ticket,

/**
 * Returns an object that contains detail about the shut down period
 * @param {util._time} [startingTime=00:00] The time to start generate, default val = 00:00
 * @return {object}   {
 *      
 *      start: 'hh:mm',
 *      end  : 'hh:mm,
 *      duration: 'hh:mm',
 *      reason  : ...
 * } 
 */



function downtime_detail_Generate(time = util._time._time()) {
    let s = util.timeGenerate(time);
    let e = util.timeGenerate(s);
    let d = e.subtract(s);
    let r = downReasons[util.rand(downReasons.length)];
    return { start: s.toStr(), end: e.toStr(), duration: d.toStr(), reason: r };
}
//#endregion

module.exports = {
    downtimeSimulating_Quit,
    downtimeSimulate,
    downtimeGenerator,
    turnOnSystem,
    turnOffSystem,
    monthlySum,
    dailySum,
    eventObj,
};
