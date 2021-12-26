const moment = require('moment');
const process = require('process');
const path = require('path');
const fs = require('fs');
//Return Code
const { code } = require('../libs/actionCode');
const { time } = require('console');



//Util func
/**
 * Change the value by specified Maxrate
 * @param {Number} value 
 * @param {Number} MaxRate 
 * @returns 
 */
function fluctuate(value, MaxRate, increase_decreaseRate = 0.38) {
    // const increase_decreaseRate = 0.35;
    return value + ((value * rand(MaxRate)) * (Math.random() >= increase_decreaseRate ? 1 : -1));

}
/**
 * 
 * @param {Number} value 
 * @param {Number} decimals 
 * @returns 
 */
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
/**
 * @param {mongoose.Connection} conn - mongoose connection
 * @param {string} collectionName 
 * @returns {Boolean}true if collectionName exists, vice versa
 */
function collectionExist(collectionName, conn) {
    return new Promise((resolve, reject) => {
        conn.db.listCollections({ name: collectionName })
            .then(collInfo => {
                if (collInfo) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(e => {
                console.log('util.collectionExist:');
                console.log(e);
                reject('Unable to operate!');
            })
    });
}
function logMsgSystem(msg) {
    console.log(`[SYSTEM]\n<${moment().format('DD/MM/yyyy - HH:mm')}>  \n\t${msg}`);
}
/**
 * Create string code follow the procedure in actionCode file
 * @param {String[]} msg 
 * @returns {String}
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


/**
 * Depend on the max number, if the max number is an interger, the function will return a random number that is between the range (max:min] (max is excluded)
 * @param {number} max 
 * @param {number} min - default value is 0
 * @returns {number}
 */
function rand(max, min = 0) {
    if (max % 1 === 0) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    else {
        return Math.random() * (max - min) + min;
    }
}

/**
 * Loading a file to Object with params.
 * @param {string} location 
 * @param {string} fileN 
 * @returns empty {msg:'errr'} if error occur, returns the object after parsing when success.
 */
function loadFile(location, fileN, logMsg = true) {
    let returnVal = {};
    try {
        returnVal = JSON.parse(fs.readFileSync(path.join(location, fileN), 'utf-8'));
        if (logMsg) {
            console.log(`[SYSTEM]: File <${path.join(location, fileN)}> Loaded Successfully`);
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`[SYSTEM]: File or path doesn't exist!\nFile: ${fileN}\nPath: ${path.join(location, path)}`);
            returnVal = { code: createCode(['loading', 'file', 'nonexistence']) };
        } else {
            console.log(err);
            returnVal = { code: createCode(['loading', 'undefined']) };
        }
    }
    return { code: createCode(['loading', 'success']), data: returnVal };
}
/**
 * Saving an Object to file with stringify method.
 * @param {string} location 
 * @param {string} fileN 
 * @param {object} data 
 * @returns true if the success, vice versa false value will be returned.
 */
function saveFile(location, fileN, data, logMsg = true) {
    try {
        fs.writeFileSync(path.join(location, fileN), JSON.stringify(data, null, 2));
        if (logMsg) {
            logMsgSystem(` File <${fileN}> Saved Successfully\n\t\tAt <${path.join(location, fileN)}`);
        }
        return createCode(['saving', 'success']);
    } catch (err) {
        logMsgSystem(`${err}\n[SYSTEM]: Error occured at saving file <${fileN}>\nLocation ${path.join(location, fileN)}`);
        return createCode(['saving', 'undefined']);
    }
}

//time support funcs
/**
 * Since moment require a date to initialize, however, in this project, there're somepoint only time is required
 * This function provide a quickway to initial a moment object without caring about the date,
 * @param {string} str a string with format 'hh:mm' to be converted into momment object.
 * @return {moment} with 01/01/2000 date with hh:mm will be used only.
 */
function createTime(str) {
    return moment("01/01/2000", "DD/MM/yyyy").hour(str.split(':')[0]).minute(str.split(':')[1]);
}

/**
 * Returns _time object with random time after startingTime
 *
 * @param {_time} startingTime The time to start generate
 * @return {_time} hh:mm.
 */
function timeGenerate(startingTime) {
    let hh, mm;
    if (startingTime.hh == 23) {
        hh = 23; //If starting time is 23, the return time will also be 23
    } else {
        hh = rand(24, startingTime.hh);
    }

    if (hh == startingTime.hh && hh != 23) {
        if (startingTime.mm >= 59) {
            // if the generated hour is the same as starting time hour, and the starting time minute is at 59, generated hour will be increased by 1
            hh++;
            mm = rand(60);
        }
        else {
            mm = rand(60, startingTime.mm + 1); // +1 to ensure the generated time will be at least 1 minute larger than the starting time
        }
    } else if (hh != startingTime.hh) {
        mm = rand(60);
    } else { // when both starting time hour and generated hour are 23(11pm)
        if (startingTime.mm < 58) {
            mm = rand(60, startingTime.mm + 1);
        } else {
            mm = 59;
        }
    }
    return new _time(hh + ':' + mm);
}



/** Class representing time */
class _time {
    /**
     * 
     * @param {moment.Moment|String} [a='00:00' ] 
     */
    constructor(a) {
        if (typeof (a) === 'string') {
            if (a.includes(':')) {
                let [hh, mm] = a.split(':');
                this.hh = parseInt(hh);
                this.mm = parseInt(mm);
            } else {
                throw 'invalid parameter  <_time> constructor <string> type'
            }
        } else if (moment.isMoment(a)) {
            this.hh = a.hour();
            this.mm = a.minute();
        } else if (a === undefined) {
            this.hh = 0;
            this.mm = 0;
        }
        else {
            throw `invalid parameter type :<_time> constructor\nPassed: ${typeof (a)} value: ${JSON.stringify(a, null, 2)}`;
        }
        if (this.hh < 0 || this.mm < 0) {
            throw 'invalid parameter <_time> constructor';
        }
        this.hh = this.hh + Math.floor(this.mm / 60);
        this.mm = this.mm % 60;
        this.type = '_time';
    }
    /**
     * get a number of hour + minute in number type
     * @returns {Number}
     */
    toNum() {
        return (+(this.hh) + (+(this.mm / 60).toFixed(5)));
    }
    /**
     * 
     * @returns {Number}
     */
    toMinnute() {
        return this.mm + this.hh * 60;
    }
    /**
     * 
     * @returns {String} - with format <hh:mm>
     */
    toStr() {
        if (this.hh < 100) {
            return `${('0' + this.hh).slice(-2)}:${('0' + this.mm).slice(-2)}`;
        } else {
            return `${(this.hh)}:${('0' + this.mm).slice(-2)}`;
        }
    }
    /**
     * Not mutate the original object
     * @param {_time} other 
     * @returns {_time} - new _time object that contains result
     */
    subtract(other) {
        if (!_time.is_time(other)) {
            throw `<_time> Subtract: invalid other param type\nExpected: <_time> but Received ${typeof (other)}`;
        }
        let mm = this.mm - other.mm;
        if (mm < 0) {
            mm = 60 + mm;
            other.hh++;

        }
        let hh = this.hh - other.hh;
        if (hh < 0) {
            throw `<_time> Subtract : negative hour in result \nThis: ${this.toStr()} Other:${other.toStr()}`;
        }
        return new _time(hh + ':' + mm);
    }
    /**
     * Not mutate the original object
     * @param {_time} other 
     * @returns {_time} - new _time object that contains result
     */
    add(other) {
        if (!_time.is_time(other)) {
            throw '<_time> calc: invalid other param type';
        }
        let hh = this.hh + other.hh;
        let mm = this.mm + other.mm;
        return new _time(hh + ':' + mm);
    }
    /**
     * Not mutate the original object
     * @param {_time} other 
     * @param {String} operator - can be subtract/sub/add/+/-
     * @returns {_time} - new _time object that contains result
     */
    calc(other, operator = 'subtract') {
        if (!_time.is_time(other)) {
            throw '<_time> calc: invalid other param type';
        }
        let hh, mm, borrow = 0;
        switch (operator) {
            case 'sub':
            case 'subtract':
            case '-':
                mm = this.mm - other.mm;
                if (mm < 0) {
                    mm = 60 + mm;
                    borrow = 1;
                    console.log('Borrowed');
                }
                hh = this.hh - other.hh - borrow;
                if (hh < 0) {
                    throw '<_time> calc : negative hour in result';
                }
                return new _time(hh + ':' + mm);
            case '+':
            case 'add':
                hh = this.hh + other.hh;
                mm = this.mm + other.mm;
                return new _time(hh + ':' + mm);
            default:
                throw '<_time>: calc Invalid Operator '
        }

    }
    /**
     * 
     * @param {moment.Moment|String} [a='00:00' ] 
     * @returns {_time}
     */
    static _time(a) {
        return new _time(a);
    }
    /**
     * 
     * @param {any} something 
     * @returns {Boolean} - true if it is _time object, vice versa.
     */
    static is_time(something) {
        if (something.type === '_time') return true;
        return false;
    }
    /**
     * 
     * @param {_time} time1 
     * @param {String} evaluatingOperator - can be <,>,==,==!,>= or lt/eq/ne/ etc
     * @param {_time} time2 
     * @returns {Boolean} the result of the comparison
     */
    static evaluate(time1, evaluatingOperator, time2) {
        if (!_time.is_time(time1)) {
            try {
                time1 = _time._time(time1);
            } catch (e) {
                throw `<_time> evaluate : invalid param (not a _time object)\nTried to convert to _time unsuccessfully\nError:${e}`;
            }
        }
        if (!_time.is_time(time2)) {
            try {
                time2 = _time._time(time2);
            } catch (e) {
                throw `<_time> evaluate : invalid param (not a _time object)\nTried to convert to _time unsuccessfully\nError:${e}`;
            }
        }
        switch (evaluatingOperator) {
            case '<':
            case 'lt':
                if (time1.hh < time2.hh) {
                    return true;
                } else if (time1.hh === time2.hh) {
                    if (time1.mm < time2.mm) {
                        return true;
                    }
                }
                return false;
            case '>':
            case 'gt':
                if (time1.hh > time2.hh) {
                    return true;
                } else if (time1.hh === time2.hh) {
                    if (time1.mm > time2.mm) {
                        return true;
                    }
                }
                return false;
            case '==':
            case 'eq':
                return (time1.hh === time2.hh && time1.mm === time2.mm);
            case '!=':
            case 'ne':
                return (time1.hh !== time2.hh || time1.mm !== time2.mm);;
            case '>=':
            case 'ge':
                if (time1.hh > time2.hh) {
                    return true;
                } else if (time1.hh === time2.hh) {
                    if (time1.mm >= time2.mm) {
                        return true;
                    }
                }
                return false;
            case '<=':
            case 'le':
                if (time1.hh < time2.hh) {
                    return true;
                } else if (time1.hh === time2.hh) {
                    if (time1.mm <= time2.mm) {
                        return true;
                    }
                }
                return false;
            default:
                console.log(`_time Obj: evaluate() Method.\nInvalid Operator ${evaluatingOperator}`);
                logMsgSystem('Invalid Operator');
                return undefined;
        }
    }
    static getHour(hhmm_str) {
        return parseInt(hhmm_str.split(':')[0]);
    }

}

module.exports = { logMsgSystem, saveFile, loadFile, rand, createTime, _time, createCode, timeGenerate, collectionExist, round, fluctuate };

// let temp = moment().hour(23).minute(59).second(0).millisecond(0);
// console.log(temp.format('yyyy-MM-DD   HH:mm:ss:SSSS'));
// temp.add(1, 'minute');
// console.log(temp.format('yyyy-MM-DD   HH:mm:ss:SSSS'));
// console.log(temp.toISOString());