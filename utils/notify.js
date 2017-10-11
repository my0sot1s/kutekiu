
/**
 * kết nối tới rabbitmq
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */

const app = require("../server/server");
const { publishToFan, subscibeATopic } = require("./network");
const cst = require("./constants");
// const logger = require("./logger");

// subscibeATopic('topic1:*', function (data) {
//     logger(data);
// })