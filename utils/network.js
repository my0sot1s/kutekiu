/**
 * kết nối tới rabbitmq
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */
const cst = require("./constants")
const { RABBITMQ_USER, RABBITMQ_PW, RABBITMQ_HOST, RABBITMQ_NAME } = process.env;
const Promise = require("bluebird")
const url = "amqp://" + RABBITMQ_USER + ":" + RABBITMQ_PW + "@" + RABBITMQ_HOST + "/" + RABBITMQ_NAME;
// console.log(url)
const bus = require('servicebus').bus({ url, delayOnStartup: 0, confirmChannel: true });
const OPTIONS = { routingKey: 'cms_notify.broadcast' }

// bus.use(bus.package());

/**
 * Note:
 * 
 * Nếu dùng 1-1 sử dụng `sendToQueue` and `listenMessage`
 * Nếu dùng 1-n sử dụng  `publishToFan` and `subscibeATopic`
 * Xem issues https://github.com/mateodelnorte/servicebus/issues/97
 */

/**
 * send message to queue or many queue
 * queue just templerary queue 
 * will disappear when some people recieve
 * just 1-1 and remove
 * @param {string|string[]} queueName 
 * @param {{}} message 
 */
function sendToQueue(queueName, message) {
    function sendDataToQueue(queue, message) {
        return bus.send(queue, message)
    }
    if (Array.isArray(queueName)) {
        return Promise.map(queueName, function (queue) {
            sendDataToQueue(queue, message);
        })
    } else {
        sendDataToQueue(queueName, message);
    }
}


/**
 * 
 * @param {string} queueName 
 * @param {cb} cb 
 */
function listenMessage(queueName, cb) {
    return bus.listen(queueName, function (event) {
        if (event) cb(event);
    });
}

/**
 * 
 * @param {string} queueName 
 * @param {cb} cb 
 */
function listenAsync(queueName) {
    return new Promise((resolve, reject) => {
        return bus.listen(queueName, function (event) {
            if (event) resolve(event);
            else reject()
        });
    })
}


/**
 * publish a object to a topic 
 * any one subscibe that topic can receive message
 * topic can be a string or pattern regex
 * @param {string,{}} topic - or pattern
 * @param {{}} message 
 * 
 * Phát sóng 1 bản tin qua topic {string} 
 * các queue được bind thì sẽ nhận bản đc bản tin
 */
function publishToFan(topic, message) {

    if (typeof topic === 'string') {
        let _topic = { queueName: OPTIONS.routingKey + "." + topic, routingKey: OPTIONS.routingKey }
        bus.publish(_topic, message);
    }
    else bus.publish(topic, message);
}

/**
 * get a message for fan-out when subscribe a topic pattern
 * @param {string,{}} topic 
 * @param {cb} cb 
 * 
 * lắng nghe bản tin được phát sóng. 
 * {string} topic là queue đc bind vào exchange amq.topic với 1 routing ke phù hợp
 */
function subscibeATopic(topic, cb) {
    if (typeof topic === 'string') {
        let _topic = { queueName: OPTIONS.routingKey + "." + topic, routingKey: OPTIONS.routingKey }
        bus.subscribe(_topic, function (ev) {
            if (ev) cb(ev);
        });
    }
    else bus.subscribe(_topic, function (ev) {
        if (ev) cb(ev);
    });
}

function rundemo() {
    // sendAsync(cst.PREFIX_SOURCES_QUEUE + "111", { hello: 111 })
    // sendToQueue('1111', { a: 1111 })
    // listenMessage("1111", doc => { console.log(doc) })


}
module.exports = {
    sendToQueue, listenMessage, listenAsync, rundemo,
    publishToFan, subscibeATopic
}