const Config = require('./config');
const Fs = require('fs');

let LogUtils = {};

LogUtils.logError = function (msg) {
    console.log("\x1b[31m", msg); 
};

LogUtils.logOk = function (msg) {
    console.log("\x1b[32m", msg); 
};

LogUtils.logInfo = function (msg) {
    console.log(msg);
};

LogUtils.logProceduresInfo = async function (proceduresInfo) {
    const logFile = Config.proceduresLogFile;
    LogUtils.logInfo('Saving procedures info into ' + logFile);
    console.dir(proceduresInfo);

    // 4 - means identations with 4 spaces in JSON string representaion
    const dataToLog = JSON.stringify(proceduresInfo, null, 2);

    await Fs.writeFileSync(logFile, dataToLog, 'utf8');
};

module.exports = LogUtils;