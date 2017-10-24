'use strict';

const cst = require("../../../utils/constants");
const app = require("../../../server/server");
const { sendToQueue, listenMessage, publishToFan, subscibeATopic } = require("../../../utils/network");
/**
 * kết nối tới rabbitmq
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */
module.exports = function (Emailservice) {

    /**
     * @param {string} to @required
     * @param {string} subject @required
     * @param {string} text 
     * @param {string} html 
     * @param {cb} cb
     */
    Emailservice.sendAnEmail = function (to, subject, html, cb) {
        app.models.EmailRef.send({ to, from: cst.EMAIL_NAME, subject, html },
            function (err, info) {
                if (err) cb(null, cst.FAILURE_CODE, err, cst.NULL_OBJECT)
                else cb(null, cst.SUCCESS_CODE, "SENT", cst.NULL_OBJECT)
            })
    }
    Emailservice.remoteMethod("sendAnEmail", {
        http: { path: "/sendAnEmail", verb: "POST" },
        accepts: [
            { arg: "to", type: "string", required: true },
            { arg: "subject", type: "string", required: true },
            { arg: "html", type: "string", required: true },
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    });

    // setInterval(() => {
    //     i++
    //     sendToQueue(cst.QUEUE_EMAIL, { actionId: i, payload: { email: "xxx@zzzz.ccc" } })
    // }, 2000)

    // lắng nghe cổng email
    // nếu nhận đc thì gửi
    // Emailservice.autoMail = function () {
    //     listenMessage(cst.QUEUE_EMAIL, function (payload) {
    //         // do st
    //         app.models.SystemLogs.logger(JSON.stringify(payload));
    //     });
    // }
    // Emailservice.autoMail();

    // setInterval(() => {
    //     i++;
    //     publishToFan('user', { kk: i });
    // }, 1500)


    // publishToFan('user', { kk: 1 });

    // subscibeATopic('user1', function (payload) {
    //     logger(JSON.stringify(payload));
    // });
    // subscibeATopic('user2', function (payload) {
    //     logger(JSON.stringify(payload));
    // });
};