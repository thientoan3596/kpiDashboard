const moment = require('moment');
const fs = require('fs');
function log(msg, type) {
    let logMsg = `[${moment().format('Do MMM')}][${moment().format('HH:mm')}]][${type}][${msg}]\n`;
    fs.writeFile('log.txt', logMsg, { flag: 'a' }, () => { });
}
module.exports = {
    log
};
