const process = require('process');
const code = {
    success: 0,
    ended: 10,
    failure: 1,
    undefined: 11,
    downtime: 2,
    production: 22,
    price: 222,
    monthly: 3,
    daily: 33,
    hourly: 333,
    simulating: 5,
    generating: 55,
    summarizing: 555,
    running: 6,
    notRunning: 66,
    nonexistence: 7,
    existed: 77,
    empty: 777,
    system: 8,
    data: 88,
    file: 888,
    loading: 9,
    saving: 99,
}
const downReasons = ['service', 'brokenMachine', 'others', 'uncategozied'];
let systemStatus = {
    isRunning: false,
    overnightProcedureRequired: false,
    isSimulating: false,
    sequenceInterval: 60000,

}
const config = {
    downtime: {
        generatingRate: 0.4,
        offRate: 0.005, //0.005
        onRate: 0.03, //0.03
    },
    production: {
        inputPerMin: 600,
        maxDefectRate: {
            proccessA: 0.15,
            proccessB: 0.2,
            proccessC: 0.1
        }
    },
    price: {
        rate: {
            material: 0.2,
            paint: 0.1,
            box: 0.15,
            toolReplace: 0.08,
            labourCost: 0.05
        },
        priceList: {
            raw: {
                material: 10,
                paint: 0.5,
                box: 2.1
            },
            toolReplace: 0.3,
            labourCost: 8.5 //this is per worker per hour => should be x 10 workers
        }
    }
}
/**
 * 
 * @param {stringArr} msg 
 * @returns simply sending back code that has been chained
 */

function createCode(msg) {
    let val = '';
    let i = 0;
    while (i < msg.length) {
        if (code[msg[i]] === undefined) {
            console.log('[Coding Error!] Invalid msgCode: ' + msg[i]);
            process.exit(-1);
        }
        val += code[msg[i]];
        i++;
    }
    return val;
}


module.exports = { code, downReasons, systemStatus, config, createCode };



///test

