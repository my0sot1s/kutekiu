'use strict';

/**
 * @author - te.ng  <manhte231>
 */
module.exports = function (Systemlogs) {

    Systemlogs.createLog = function (message, isImmediate) {
        SystemLogs.create(
            {
                message,
                dateImport: new Date(),
                flag: false,
                isImmediate: isImmediate ? true : false
            }, function (err, doc) {
                if (err) console.error("Can't connect to db - ", err);
            })
    }
    Systemlogs.logger = function (message, isSave, isImmediate) {
        if (!isSave)
            console.log("System: " + message);
        else Systemlogs.createLog(message, isImmediate)
    }

};
