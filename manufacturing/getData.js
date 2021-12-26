const { systemStatus: sysStatus } = require('./system/info');
const { downtime, price, production, downReasons, mongoUri } = require('./config/config');

const DowntimeSchema = require('./Schema/Downtime/Downtime');
const DailyDowntimeSchema = require('./Schema/Downtime/DailyDowntime');
const MonthlyDowntimeSchema = require('./Schema/Downtime/MonthlyDowntime');
const PriceSchema = require('./Schema/Price/Price');
const _24HoursProductionSchema = require('./Schema/Production/_24HoursProduction');
const DailyProductionSchema = require('./Schema/Production/DailyProduction');
const MonthlyProductionSchema = require('./Schema/Production/MonthlyProduction');
const DailyRevenueSchema = require('./Schema/Price/DailyRevenue');
const MonthlyRevenueSchema = require('./Schema/Price/MonthlyRevenue');



const util = require('./libs/util');
const mongoose = require('mongoose');
const moment = require('moment');
/**
 * Get system status (is running)
 * @returns {Boolean}
 */
function systemStatus() {
    return sysStatus.isRunning;
}
/**
 * Lists of down reasons
 * @returns {Array}
 */
function downReasonList() {
    return downReasons;
}

/**
 * Promise
 * Get the monthly doc or whole collection
 * @param {String} dateStr  - yyyy-MM-DD
 * @returns error->undefined, whole collection-> Arr, single docs->Obj,not found ->null|Empty Arr
 */
function monthlyDowntime(dateStr = null, field = null) {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + downtime.database);
        const Model = conn.model('Monthlydowntime', MonthlyDowntimeSchema);
        if (dateStr === null) {
            try {
                const returnVal = await Model.find({});
                resolve(returnVal);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        } else if (dateStr === 'YTD') {
            const year = moment().year();
            try {
                const result = await Model.find({ date: { $regex: year } })
                resolve(result);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        else {
            try {
                let returnVal = await Model.findOne({ date: moment(dateStr).format('yyyy-MMMM') });
                if (field == null) {
                    resolve(returnVal);

                } else {
                    resolve(returnVal[field]);
                }
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        conn.close();
    })

}
/**
 * Promise
 * Get the daily doc or whole collection
 * @param {String} dateStr  - yyyy-MM-DD
 * @returns error->undefined, whole collection-> Arr, single docs->Obj,not found ->null|Empty Arr
 */
function dailyDowntime(dateStr = null, field = null) {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + downtime.database);
        const Model = conn.model('DailyDowntime', DailyDowntimeSchema);
        if (dateStr === null) {
            try {
                const returnVal = await Model.find({});
                resolve(returnVal);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        } else {
            try {
                let returnVal = await Model.findOne({ date: moment(dateStr).format('yyyy-MM-DD') });
                if (field == null) {
                    resolve(returnVal);

                } else {
                    resolve(returnVal[field]);
                }
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        conn.close();
    })
}
/**
 * promise
 * Get the doc(with details) or whole collection | day without downtime will be null
 * @param {String} dateStr  - yyyy-MM-DD
 * @returns error->undefined, whole collection-> Arr, single docs->Obj, not found ->null|Empty Arr
 */
function _downtime(dateStr = null, field = null) {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + downtime.database);
        const Model = conn.model('Downtime', DowntimeSchema);
        if (dateStr === null) {
            try {
                const returnVal = await Model.find({});
                resolve(returnVal);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        } else {
            try {
                let returnVal = await Model.findOne({ date: moment(dateStr).format('yyyy-MM-DD') });
                if (field == null) {
                    resolve(returnVal);

                } else {
                    resolve(returnVal[field]);
                }
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        conn.close();
    })
}
/**
 * promise
 * Get the last pricelist
 * @returns error->undefined, whole collection-> Arr, single docs->Obj, not found ->null|Empty Arr
 */
function lastPriceList() {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + price.database);
        const Model = conn.model('Price', PriceSchema);
        try {
            const returnVal = await Model.find({});
            resolve(returnVal.at(-1));
        } catch (error) {
            console.log(error);
            reject(undefined);
        }
        conn.close();
    })
}
/**
 * promise
 * Get the 24 production detail -
 * @returns error->undefined, success->Arr
 */
function _24HoursProduction() {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + production.database);
        const Model = conn.model('24HoursProduction', _24HoursProductionSchema);
        try {
            const returnVal = await Model.find({});
            resolve(returnVal);
        } catch (error) {
            console.log(error);
            reject(undefined);
        }
        conn.close();
    })

}
/**
 * promise
 * Get the docor whole collection 
 * @param {String} dateStr  - yyyy-MM-DD
 * @returns error->undefined, whole collection-> Arr, single docs->Obj, not found ->(null|Empty Arr)
 */
function dailyProduction(dateStr = null, field = null) {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + production.database);
        const Model = conn.model('DailyProduction', DailyProductionSchema);
        if (dateStr === null) {
            try {
                const returnVal = await Model.find({});
                resolve(returnVal);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        } else {
            try {
                let returnVal = await Model.findOne({ date: moment(dateStr).format('yyyy-MM-DD') });
                if (field === null) {
                    resolve(returnVal);
                } else {
                    resolve(returnVal[field]);
                }

            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        conn.close();
    })
}
/**
 * promise
 * Get the docor whole collection 
 * @param {String} dateStr  - yyyy-MM-DD
 * @returns error->undefined, whole collection-> Arr, single docs->Obj, not found ->(null|Empty Arr)
 */
function monthlyProduction(dateStr = null, field = null) {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + production.database);
        const Model = conn.model('MonthlyProduction', MonthlyProductionSchema);
        if (dateStr === null) {
            try {
                const returnVal = await Model.find({});
                resolve(returnVal);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        } else if (dateStr === 'YTD') {
            let year = moment().year();
            try {
                const result = await Model.find({ date: { $regex: year } })
                resolve(result);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        else {
            try {
                let returnVal = await Model.findOne({ date: moment(dateStr).format('yyyy-MMMM') });
                if (field === null) {
                    resolve(returnVal);
                } else {
                    resolve(returnVal[field]);
                }

            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        conn.close();
    })
}

/**
 * promise
 * Get the docor whole collection 
 * @param {String} dateStr  - yyyy-MM-DD
 * @returns error->undefined, whole collection-> Arr, single docs->Obj, not found ->(null|Empty Arr)
 */
function dailyRevenue(dateStr = null, field = null) {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + price.database);
        const Model = conn.model('DailyRevenue', DailyRevenueSchema);
        if (dateStr === null) {
            try {
                const returnVal = await Model.find({});
                resolve(returnVal);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        } else {
            try {
                let returnVal = await Model.findOne({ date: moment(dateStr).format('yyyy-MM-DD') });
                if (field === null) {
                    resolve(returnVal);
                } else {
                    resolve(returnVal[field]);
                }
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        conn.close();
    })
}
/**
 * promise
 * Get the docor whole collection 
 * @param {String} dateStr  - yyyy-MM-DD
 * @returns error->undefined, whole collection-> Arr, single docs->Obj, not found ->(null|Empty Arr)
 */
function monthlyRevenue(dateStr = null, field = null) {
    return new Promise(async (resolve, reject) => {
        const conn = mongoose.createConnection(mongoUri + price.database);
        const Model = conn.model('MonthlyRevenue', MonthlyRevenueSchema);
        if (dateStr === null) {
            try {
                const returnVal = await Model.find({});
                resolve(returnVal);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        } else if (dateStr === 'YTD') {
            let year = moment().year();
            try {
                const result = await Model.find({ date: { $regex: year } })
                resolve(result);
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        } else {
            try {
                let returnVal = await Model.findOne({ date: moment(dateStr).format('yyyy-MMMM') });
                if (field === null) {
                    resolve(returnVal);
                } else {
                    resolve(returnVal[field]);
                }
            } catch (error) {
                console.log(error);
                reject(undefined);
            }
        }
        conn.close();
    })
}
function minute(from, to = null) {
    if (to == null) {
        to = moment();
    }
    if (moment.isMoment(from)) {
        return ((to.toDate() - from.toDate()) / 60000);
    } else {
        from = moment(from);
        to = moment(to);
        return ((to.toDate() - from.toDate()) / 60000);
    }


}

function OEE(dateStr = null) {
    return new Promise((resolve, reject) => {
        if (dateStr === null) {
            monthlyProduction("YTD")
                .then((results) => {
                    let Availability = 0;
                    let Quality = 0;
                    let totalOutput = 0;
                    let totalInput = 0;
                    let Performance = 0;
                    results.forEach(r => {
                        Availability += r.productionTime;
                        totalInput += r.proccessA.input;
                        totalOutput += r.output;
                        Performance += r.performance;
                    });
                    Availability = Availability / minute(moment(results[0].date + '-01', 'yyyy-MMMN-DD'));
                    Quality = totalOutput / totalInput;
                    Performance = Performance / results.length;
                    const OEE = Availability * Quality * Performance;
                    resolve(OEE);
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        } else if (dateStr == 'monthly') {
            monthlyProduction()
                .then((results) => {
                    let Availability = [];
                    let Quality = [];
                    let Performance = [];
                    let OEE = [];
                    let labels = [];
                    results.forEach(r => {
                        labels.push([r.date.split('-')[1].substring(0, 3), r.date.split('-')[0]]);
                        let from = moment(r.date + '-01', 'yyyy-MMMN-DD');
                        let to = moment().isAfter(from) ? moment(from).endOf('month') : moment();
                        Availability.push(r.productionTime / minute(from, to));
                        Quality.push(r.output / r.proccessA.input);
                        Performance.push(r.performance);
                        OEE.push(Availability.at(-1) * Quality.at(-1) * Performance.at(-1));
                    });
                    const Response = {
                        labels,
                        datasets: [
                            {
                                label: 'Availability',
                                data: Availability.map(i => i * 100),
                            }, {
                                label: 'Quality',
                                data: Quality.map(i => i * 100),
                            }, {
                                label: 'Performance',
                                data: Performance.map(i => i * 100),
                            }, {
                                label: 'OEE',
                                data: OEE.map(i => i * 100),
                            },
                        ]
                    }
                    resolve(Response);
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        } else if (dateStr === "daily") {
            dailyProduction()
                .then((results) => {
                    let Availability = [];
                    let Quality = [];
                    let Performance = [];
                    let OEE = [];
                    let labels = [];
                    results.forEach(r => {
                        labels.push([moment(r.date).format('Do'), moment(r.date).format('MMM')]);
                        Availability.push(r.productionTime / 1440);
                        Quality.push(r.output / r.proccessA.input);
                        Performance.push(r.performance);
                        OEE.push(Availability.at(-1) * Quality.at(-1) * Performance.at(-1));
                    });
                    const Response = {
                        labels,
                        datasets: [
                            {
                                label: 'Availability',
                                data: Availability.map(i => i * 100),
                            }, {
                                label: 'Quality',
                                data: Quality.map(i => i * 100),
                            }, {
                                label: 'Performance',
                                data: Performance.map(i => i * 100),
                            }, {
                                label: 'OEE',
                                data: OEE.map(i => i * 100),
                            },
                        ]
                    }
                    resolve(Response);
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        }
        else {
            let endDate;
            const startDate = moment(endDate).startOf('month');
            if (moment(dateStr).isSame(moment(), 'month')) {
                endDate = moment();
            } else {
                endDate = moment(dateStr).endOf('month');
            }
            monthlyProduction(dateStr)
                .then((result) => {
                    const Availability = result.productionTime / minute(moment(dateStr).startOf('month'));
                    const Quality = result.output / result.proccessA.input;
                    const Performance = result.performance;
                    const OEE = Availability * Quality * Performance;
                    resolve(OEE)
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        }
    })

}

function OOE(dateStr = null) {
    return new Promise((resolve, reject) => {
        if (dateStr === null) {
            monthlyProduction("YTD")
                .then((results) => {
                    let Availability = 0;
                    let OperatingTime = 0;
                    let Quality = 0;
                    let totalOutput = 0;
                    let totalInput = 0;
                    let Performance = 0;
                    results.forEach(r => {
                        Availability += r.productionTime;
                        totalInput += r.proccessA.input;
                        totalOutput += r.output;
                        Performance += r.performance;
                        OperatingTime += r.operatingTime;
                    });
                    // console.log(Availability);
                    // console.log(moment().subtract(results.length, 'day'));
                    Availability = Availability / OperatingTime;
                    Quality = totalOutput / totalInput;
                    Performance = Performance / results.length;
                    const OEE = Availability * Quality * Performance;
                    resolve(OEE);
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        } else if (dateStr == 'monthly') {
            monthlyProduction()
                .then((results) => {
                    let Availability = [];
                    let Quality = [];
                    let Performance = [];
                    let OOE = [];
                    let labels = [];
                    results.forEach(r => {
                        labels.push([r.date.split('-')[1].substring(0, 3), r.date.split('-')[0]]);
                        Availability.push(r.productionTime / r.operatingTime);
                        Quality.push(r.output / r.proccessA.input);
                        Performance.push(r.performance);
                        OOE.push(Availability.at(-1) * Quality.at(-1) * Performance.at(-1));
                    });
                    const Response = {
                        labels,
                        datasets: [
                            {
                                label: 'Availability',
                                data: Availability.map(i => i * 100),
                            }, {
                                label: 'Quality',
                                data: Quality.map(i => i * 100),
                            }, {
                                label: 'Performance',
                                data: Performance.map(i => i * 100),
                            }, {
                                label: 'OOE',
                                data: OOE.map(i => i * 100),
                            },
                        ]
                    }
                    resolve(Response);
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        } else if (dateStr === "daily") {
            dailyProduction()
                .then((results) => {
                    let Availability = [];
                    let Quality = [];
                    let Performance = [];
                    let OOE = [];
                    let labels = [];
                    results.forEach(r => {
                        labels.push([moment(r.date).format('Do'), moment(r.date).format('MMM')]);
                        Availability.push(r.productionTime / r.operatingTime);
                        Quality.push(r.output / r.proccessA.input);
                        Performance.push(r.performance);
                        OOE.push(Availability.at(-1) * Quality.at(-1) * Performance.at(-1));
                    });
                    const Response = {
                        labels,
                        datasets: [
                            {
                                label: 'Availability',
                                data: Availability.map(i => i * 100),
                            }, {
                                label: 'Quality',
                                data: Quality.map(i => i * 100),
                            }, {
                                label: 'Performance',
                                data: Performance.map(i => i * 100),
                            }, {
                                label: 'OOE',
                                data: OOE.map(i => i * 100),
                            },
                        ]
                    }
                    resolve(Response);
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        } else {
            let endDate;
            const startDate = moment(endDate).startOf('month');
            if (moment(dateStr).isSame(moment(), 'month')) {
                endDate = moment();
            } else {
                endDate = moment(dateStr).endOf('month');
            }
            monthlyProduction(dateStr)
                .then((result) => {
                    const Availability = result.productionTime / result.operatingTime;
                    const Quality = result.output / result.proccessA.input;
                    const Performance = result.performance;
                    const OEE = Availability * Quality * Performance;
                    resolve(OEE)
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        }
    })

}
function qualityPerformance(dateStr = null) {
    return new Promise((resolve, reject) => {
        if (dateStr === null) {
            monthlyProduction("YTD")
                .then((results) => {

                    let Quality = 0;
                    let totalOutput = 0;
                    let totalInput = 0;
                    let Performance = 0;
                    results.forEach(r => {
                        totalInput += r.proccessA.input;
                        totalOutput += r.output;
                        Performance += r.performance;
                    });
                    // console.log(Availability);
                    // console.log(moment().subtract(results.length, 'day'));
                    Quality = totalOutput / totalInput;
                    Performance = Performance / results.length;
                    let ProductionVolume = totalOutput;
                    const data = {
                        Performance,
                        Quality,
                        ProductionVolume
                    }
                    resolve(data);
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        } else {
            let endDate;
            const startDate = moment(endDate).startOf('month');
            if (moment(dateStr).isSame(moment(), 'month')) {
                endDate = moment();
            } else {
                endDate = moment(dateStr).endOf('month');
            }
            monthlyProduction(dateStr)
                .then((result) => {
                    const Performance = result.performance;
                    const Quality = result.output / result.proccessA.input;
                    const ProductionVolume = result.output;
                    const data = {
                        Performance,
                        Quality,
                        ProductionVolume
                    }
                    resolve(data);
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        }
    })
}
function _production(dateStr = null) {
    return new Promise((resolve, reject) => {
        if (dateStr === null) {
            monthlyProduction('YTD')
                .then((results) => {
                    let ProductionTime = 0;
                    let OperatingTime = 0;

                    results.forEach(r => {
                        ProductionTime += r.productionTime;
                        OperatingTime += r.operatingTime;
                    });
                    ProductionTime = Math.round(ProductionTime / 60);
                    OperatingTime = Math.round(OperatingTime / 60);
                    monthlyDowntime('YTD')
                        .then((results2) => {
                            let hh = 0;
                            let mm = 0;
                            results2.forEach(r => {
                                hh += parseInt(r.total.split(':')[0]);
                                mm += parseInt(r.total.split(':')[1]);
                            });
                            let Downtime = hh + Math.round(mm / 60);
                            const data = {
                                ProductionTime,
                                OperatingTime,
                                Downtime
                            }

                            resolve(data);

                        }).catch((err) => {
                            console.log(err);
                            reject(0);
                        });
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        } else {
            let endDate;
            const startDate = moment(endDate).startOf('month');
            if (moment(dateStr).isSame(moment(), 'month')) {
                endDate = moment();
            } else {
                endDate = moment(dateStr).endOf('month');
            }
            monthlyProduction(dateStr)
                .then((result1) => {

                    monthlyDowntime(dateStr)
                        .then((result2) => {
                            let ProductionTime = Math.round(result1.productionTime / 60);
                            let OperatingTime = Math.round(result1.operatingTime / 60);
                            let Downtime = parseInt(result2.total.split(':')[0]);
                            const data = {
                                ProductionTime,
                                OperatingTime,
                                Downtime
                            }
                            resolve(data);
                        }).catch((err) => {
                            reject(0);
                        });
                }).catch((err) => {
                    console.log(err);
                    reject(0);
                });
        }
    })
}
module.exports = {
    systemStatus,
    downReasonList,
    monthlyDowntime,
    dailyDowntime,
    _downtime,
    lastPriceList,
    _24HoursProduction,
    dailyProduction,
    monthlyProduction,
    dailyRevenue,
    monthlyRevenue,
    minute,
    OEE,
    OOE,
    qualityPerformance,
    _production
};
