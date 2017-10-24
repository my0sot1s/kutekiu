

/**
 * 
 * 
 * @author te.ng - <manhte231>
 * 
 * 
 * 
 */

const netw = require("../../utils/network")
const Promise = require("bluebird")
const cst = require("../../utils/constants")

module.exports = function (app) {
    /**
     * work with queue
     * 
     * @description người nhận - marcarita
     */
    netw.listenMessage(cst.PREFIX_SOURCES_QUEUE + "get2Comment", (params) => {
        if (params.post_id && Array.isArray(params.post_id)) {
            return Promise.map(params.post_id, p => {
                return app.models.social_comments
                    .getDetailComment(p)
                    .then(log => {
                        return { comment: { count: log[0], cmt: log[1] } }
                    })
                    .catch(err => {
                        return err;
                    })
            })
                .then(comment => {
                    return Promise.map(params.post_id, (p, index) => {
                        return app.models.social_like
                            .getPostLike(p)
                            .then(log => {
                                return { like: log, ...comment[index] }
                            })
                            .catch(err => {
                                return err;
                            })
                    })
                })
                .then(doc => {
                    console.info("\nReaded and sending message!!\n");
                    return netw.sendToQueue(cst.PREFIX_DESTINATIONS_QUEUE + "get2Comment", doc)
                }).catch(err => {
                    return console.error(err);
                })
        } else {
            console.error("Định dạng message? Lỗi");
            return;
        }
    })
}