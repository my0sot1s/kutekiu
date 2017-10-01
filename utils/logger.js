/**
 * 
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */
const app = require("../server/server");
/**
 * @param {string} message
 * @param {boolean} isSave @default false|void
 * @param {boolean} isImmediate @default false|void
 * 
 */
function logger(message, isSave, isImmediate) {
    if (!isSave)
        console.log("System: " + message);
    else
        app.models.SystemLogs.create(
            {
                message,
                dateImport: new Date(),
                flag: false,
                isImmediate: isImmediate ? true : false
            }, function (err, doc) {
                if (err) console.error("Can't connect to db - ", err);
            })
}

module.exports = logger;