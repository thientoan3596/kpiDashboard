
import { parsingDefaultConfig } from "./util.js";
const COLOR_PALLETE2 = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];

export function label_Process(labelStr) {
    if (labelStr[0] !== labelStr[0].toUpperCase()) {

        return labelStr.replace(/([A-Z])/, " $1").replace(/(.)/, function (v) { return v.toUpperCase() });
    }
    return labelStr;
}

const option_default_parseData = { minuteFormatContain: false, labelType: 1, timeFormatContain: false }
/**
 * Parsing data from server to fe format and remove unimportant fields
 * labelType: 1-Do/MMM   2-MMM/yyyy
 * @param {Object} data -the whole record from db
 * @param {Object} destination - Object 
 * @param {Object} [option] -  [minuteFormatContain=false] [labelType=1] <1: yyyy-mm-dd | 2:yyyy-MMMM>  [timeFormatContain=false]
 */
export function parseData(data, destination, option = option_default_parseData) {
    parsingDefaultConfig(option, option_default_parseData);
    destination.labels = [];
    destination.datasets = {};
    data.forEach(i => {
        for (let [key, val] of Object.entries(i)) {
            if (key !== '_id' && key !== '__v' && key !== "updateTime" && key !== "updatedBy") {
                // labelType: 1-Do/MMM   2-MMM/yyyy
                if (key === 'date' && option.labelType === 1) {
                    destination.labels.push([moment(val).format('Do'), moment(val).format('MMM')]);
                } else if (key === 'date' && option.labelType === 2) {
                    destination.labels.push([val.split('-')[1].substring(0, 3), val.split('-')[0]]);
                } else if (key === 'time') {
                    let momentObj = moment().hour(parseInt(val.split(":")[0])).minute(parseInt(val.split(":")[1]));
                    if (moment().hour() < 2) {
                        if (momentObj.hours() === 22 || momentObj.hours() === 23) {
                            momentObj.subtract(1, 'd');
                        }
                    }

                    destination.labels.push(momentObj.toDate());
                    // destination.labels.push(val);
                    // console.log(moment().hours(parseInt(val.split(":")[0])).minute(parseInt(val.split(":")[1])));
                } else if (typeof (val) == 'object') {
                    for (let [subKey, subVal] of Object.entries(val)) {
                        if (!((label_Process(key) + ' ' + label_Process(subKey)) in destination.datasets)) {
                            destination.datasets[label_Process(key) + ' ' + label_Process(subKey)] = {
                                label: label_Process(key) + ' ' + label_Process(subKey),
                                data: []
                            };
                        }
                        /**
                         * Make sure vals represent percent(eg:0.xx) is converted to xx%
                         */
                        if (subVal < 1 && subVal > 0) {
                            destination.datasets[label_Process(key) + ' ' + label_Process(subKey)].data.push(subVal * 100);
                        } else {
                            destination.datasets[label_Process(key) + ' ' + label_Process(subKey)].data.push(subVal);
                        }
                    }
                }
                else {
                    if (key === 'uncategozied') {
                        /**
                         * Database misspelled uncategorized into uncategozied
                         */
                        if (!('Uncategorized' in destination.datasets)) {
                            destination.datasets.uncategorized = {
                                label: 'Uncategorized',
                                data: []
                            };
                        }
                        destination.datasets.uncategorized.data.push(parseInt(val.split(':')[0]) + (parseInt(val.split(':')[1])) / 60);
                    } else {
                        if (!(label_Process(key) in destination.datasets)) {
                            destination.datasets[label_Process(key)] = {
                                label: label_Process(key),
                                data: []
                            };
                        }
                        if (typeof (val) === 'number') {
                            /**
                             * if key contains time keyword and there is minuteFormatContain flag
                             */
                            if (option.minuteFormatContain && key.toLowerCase().includes('time')) {
                                destination.datasets[label_Process(key)].data.push(val / 60);
                            } else {
                                /**
                                 * Make sure vals represent percent(eg:0.xx) is converted to xx%
                                 */
                                if (val < 1 && val > 0) {
                                    destination.datasets[label_Process(key)].data.push(val * 100);

                                } else {
                                    destination.datasets[label_Process(key)].data.push(val);

                                }
                            }
                        } else {
                            if (option.timeFormatContain) {
                                if (typeof (val) != 'string') {
                                    console.error('data proccess>ParseData:', val);
                                }
                                destination.datasets[label_Process(key)].data.push(parseInt(val.split(':')[0]) + (parseInt(val.split(':')[1])) / 60);
                            } else {
                                console.error('String but no time format contain\n', val);
                            }
                        }
                    }

                }

            }
        }
    });

    destination.updatedAt = moment();
}

export function dataPush(newData, destination, option = option_default_parseData) {
    for (let [key, val] of Object.entries(newData.at(-1))) {
        if (key !== '_id' && key !== '__v' && key !== "updateTime" && key !== "updatedBy") {
            // labelType: 1-Do/MMM   2-MMM/yyyy
            if (key === 'date' && option.labelType === 1) {
                destination.labels.push([moment(val).format('Do'), moment(val).format('MMM')]);
            } else if (key === 'date' && option.labelType === 2) {
                destination.labels.push([val.split('-')[1].substring(0, 3), val.split('-')[0]]);
            } else if (key === 'time') {
                // destination.labels.push(val);
                destination.labels.push(moment().hour(parseInt(val.split(":")[0])).minute(parseInt(val.split(":")[1])).toDate());
            } else if (typeof (val) == 'object') {
                for (let [subKey, subVal] of Object.entries(val)) {
                    /**
                     * Make sure vals represent percent(eg:0.xx) is converted to xx%
                     */
                    if (subVal < 1 && subVal > 0) {
                        destination.datasets[label_Process(key) + ' ' + label_Process(subKey)].data.push(subVal * 100);
                    } else {
                        destination.datasets[label_Process(key) + ' ' + label_Process(subKey)].data.push(subVal);
                    }
                }
            }
            else {
                if (key === 'uncategozied') {
                    /**
                     * Database misspelled uncategorized into uncategozied
                     */

                    destination.datasets.uncategorized.data.push(parseInt(val.split(':')[0]) + (parseInt(val.split(':')[1])) / 60);
                } else {

                    if (typeof (val) === 'number') {
                        /**
                         * if key contains time keyword and there is minuteFormatContain flag
                         */
                        if (option.minuteFormatContain && key.toLowerCase().includes('time')) {
                            destination.datasets[label_Process(key)].data.push(val / 60);
                        } else {
                            /**
                             * Make sure vals represent percent(eg:0.xx) is converted to xx%
                             */
                            if (val < 1 && val > 0) {
                                destination.datasets[label_Process(key)].data.push(val * 100);

                            } else {
                                destination.datasets[label_Process(key)].data.push(val);

                            }
                        }
                    } else {
                        if (option.timeFormatContain) {
                            if (typeof (val) != 'string') {
                                console.error('data proccess>ParseData:', val);
                            }
                            destination.datasets[label_Process(key)].data.push(parseInt(val.split(':')[0]) + (parseInt(val.split(':')[1])) / 60);
                        } else {
                            console.error('String but no time format contain\n', val);
                        }
                    }
                }

            }

        }
    }
}
/**
 * 
 * @param {Obj} data - NB!No Slice - Please slice data before if needed!
 * @returns 
 */
export function productionLiveDataParse(data) {
    let xVals = []
    let datasetsY = {}
    let datasetsY1 = {}
    data.forEach(d => {
        for (let [key, val] of Object.entries(d)) {
            if (key !== '_id' && key !== '__v') {
                if (key === "proccessA") {
                    for (let [subKey, subVal] of Object.entries(val)) {
                        if (subKey == "FPY") {
                            if (!('Proccess A FPY' in datasetsY1)) {
                                datasetsY1['Proccess A FPY'] = [];
                            }
                            datasetsY1['Proccess A FPY'].push(subVal * 100);
                        } else if (subKey == 'input') {
                            if (!('Input' in datasetsY)) {
                                datasetsY['Input'] = [];
                            }
                            datasetsY['Input'].push(subVal);
                        }
                    }
                }
                else if (typeof (val) == 'object') {
                    for (let [subKey, subVal] of Object.entries(val)) {
                        if (subKey == "FPY") {
                            if (!(label_Process(key) + ' FPY' in datasetsY1)) {
                                datasetsY1[label_Process(key) + ' FPY'] = [];
                            }
                            datasetsY1[label_Process(key) + ' FPY'].push(subVal * 100);
                        }
                    }
                } else if (typeof (val) == 'string') {
                    xVals.push(moment().hour(val.split(":")[0]).minute(val.split(":")[1]).toDate());
                } else {
                    if (!(label_Process(key) in datasetsY)) {
                        datasetsY[label_Process(key)] = [];
                    }
                    datasetsY[label_Process(key)].push(val);
                }
            }
        }
    });
    let _datasetsY = {};
    let counter = 0;
    for (let [key, val] of Object.entries(datasetsY)) {

        _datasetsY[key] = {
            label: key,
            data: val,
            borderWidth: 1.5,
            pointBackgroundColor: COLOR_PALLETE2[counter],
            borderColor: COLOR_PALLETE2[counter],
            backgroundColor: COLOR_PALLETE2[counter],
            fill: false,
            tension: 0.2,
            yAxisID: 'y'
        };
        counter++;
    }
    let _datasetsY1 = {};
    for (let [key, val] of Object.entries(datasetsY1)) {

        _datasetsY1[key] = {
            label: key,
            data: val,
            borderWidth: 1.5,
            pointBackgroundColor: COLOR_PALLETE2[counter],
            borderColor: COLOR_PALLETE2[counter],
            backgroundColor: COLOR_PALLETE2[counter],
            fill: false,
            tension: 0.2,
            yAxisID: 'y1'

        };
        counter++;
    }

    return {
        x: xVals,
        y: _datasetsY,
        y1: _datasetsY1
    }
}

export function shift_push_productionLiveData(data, new_unproccessed_data) {
    let x;
    let y1 = {};
    let y = {};
    for (let [key, val] of Object.entries(new_unproccessed_data)) {
        if (key !== '_id' && key !== '__v') {
            if (key === "proccessA") {
                for (let [subKey, subVal] of Object.entries(val)) {
                    if (subKey == "FPY") {
                        if (!('Proccess A FPY' in y1)) {
                            y1['Proccess A FPY'] = [];
                        }
                        y1['Proccess A FPY'] = (subVal * 100);
                    } else if (subKey == 'input') {
                        if (!('Input' in y)) {
                            y['Input'] = [];
                        }
                        y['Input'] = (subVal);
                    }
                }
            }
            else if (typeof (val) == 'object') {
                for (let [subKey, subVal] of Object.entries(val)) {
                    if (subKey == "FPY") {
                        if (!(label_Process(key) + ' FPY' in y1)) {
                            y1[label_Process(key) + ' FPY'] = [];
                        }
                        y1[label_Process(key) + ' FPY'] = (subVal * 100);
                    }
                }
            } else if (typeof (val) == 'string') {
                x = (moment().hour(val.split(":")[0]).minute(val.split(":")[1]).toDate());
            } else {
                if (!(label_Process(key) in y)) {
                    y[label_Process(key)] = [];
                }
                y[label_Process(key)] = (val);
            }
        }
    }
    for (let [key, val] of Object.entries(data)) {

        if (key === 'x') {
            val.shift();
            val.push(x);
        } else if (key === 'y') {
            for (let [subKey, subVal] of Object.entries(val)) {
                subVal.data.shift();
                subVal.data.push(y[subKey]);
            }
        }
        else {
            for (let [subKey, subVal] of Object.entries(val)) {
                subVal.data.shift();
                subVal.data.push(y1[subKey]);
            }
        }
    }
}

/**
 * 
 */
export function hourlyDataParser(data, destination) {
    destination.labels = [];
    destination.datasets = {};
    data.forEach(i => {
        for (let [key, val] of Object.entries(i)) {
            if (key !== '_id' && key !== '__v') {
                if (key === 'time') {
                    destination.labels.push(val);
                } else if (typeof (val) == 'object') {
                    for (let [subKey, subVal] of Object.entries(val)) {
                        if (!((label_Process(key) + ' ' + label_Process(subKey)) in destination.datasets)) {
                            destination.datasets[label_Process(key) + ' ' + label_Process(subKey)] = {
                                label: label_Process(key) + ' ' + label_Process(subKey),
                                data: []
                            };
                        }
                        if (subVal < 1 && subVal !== 0) {
                            datasets_and_label[label_Process(key) + ' ' + label_Process(subKey)].push(subVal * 100);
                        } else {
                            datasets_and_label[label_Process(key) + ' ' + label_Process(subKey)].push(subVal);
                        }
                    }
                }
                else {
                    if (!(key in datasets_and_label)) {
                        datasets_and_label[label_Process(key)] = [];
                    }
                    datasets_and_label[label_Process(key)].push(val);
                }

            }
        }
    });
    destination.labels = [];
    destination.labels = labels;
    if (!option.keepField) {
        destination.datasets = [];
        // let counter = 0;
        for (let [key, val] of Object.entries(datasets_and_label)) {
            destination.datasets.push({
                label: label_Process(key),
                data: val
            })
        }
    }
}
/**
 * 
 * Push a last data from array to destination
 */
export function hourlyDataUpdate(data, destination) {

}