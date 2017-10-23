'use strict';
const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const Promise = require("bluebird")
const netw = require("../../../utils/network")

/**
 * 
 * @param {date} date 
 */
function dateProcess(date) {
    date = new Date(date);
    if (typeof date.getMonth === 'function')
        return date.toISOString().slice(0, 10).replace(/-/g, "");
    else return new Date().toISOString().slice(0, 10).replace(/-/g, "");

}
// console.log(dateProcess(new Date().toDateString()))

/**
 * 
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */


module.exports = function (Socialtimeline) {

    /**
     * @param {string} id - là post_id 
     */
    Socialtimeline.pushTimeline = function (id) {
        let _date = dateProcess(new Date())

        return new Promise((resolve, reject) => {
            Socialtimeline.findOrCreate({
                dateFlow: _date
            }, { dateFlow: _date, timeline: [] })
                .then(doc => {
                    Socialtimeline.update({ id: doc[0].id },
                        { $push: { timeline: id.toString() } })
                        .then(doc => {
                            resolve(doc)
                        })
                        .catch(err => {
                            reject(err)
                        });
                })
                .catch(err => {
                    reject(err)
                });
        })
    }

    Socialtimeline.getTimeLine = function (date, limit, page, cb) {
        if (!date) date = new Date().toDateString();
        // var _d = dateProcess(date)
        let post_list_id = []
        Socialtimeline
            .findOne({
                where: {
                    dateFlow: dateProcess(date),
                    // timeline: { "slice": -2 }
                }
            })
            .then(doc => {
                if (!doc) {
                    cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, []);
                    return;
                }
                else {
                    // get all post
                    /**
                     * @property
                     * request tới service marcarita lấy dữ liệu
                     * - lấy 2comment + comment-count
                     * - lấy  like count
                     */
                    netw.sendToQueue(cst.PREFIX_SOURCES_QUEUE + "get2Comment"
                        , { post_id: doc.timeline.reverse() });
                    console.info("send to queue done!")
                    post_list_id = doc.timeline.reverse();
                    return doc.timeline.reverse()
                }
            })
            .then(doc => {
                // fetch all post trong post list
                //lấy ra toàn bộ post
                return Promise.map(doc, post_id => {
                    return app.models.social_post.findById(post_id, {
                        fields: {
                            modified: false
                        }
                    })
                })
            })
            .then(posts => {
                // dùng post để lấy người post
                // 
                return Promise.map(posts, value => {
                    return app.models.social_user.findOne({
                        where: { user_id: value.user_id },
                        fields: ["username", "displayName", "avatar"]
                    }).then(user => {
                        return { user, post: value }
                    }).catch(err => err)
                })
            })
            .then(post => {
                return netw.listenAsync(cst.PREFIX_DESTINATIONS_QUEUE + "get2Comment").then(c => {
                    return Promise.map(post, (value, index) => {
                        console.info("get from queue done!");
                        return { ...value, ...c[index] }
                    })
                })
            })
            // .then(doc => {
            //     return Promise.map(doc, p => {
            //         return app.models.social_comments
            //             .getDetailComment(p.post.id.toString())
            //             .then(log => {
            //                 return { ...p, comment: { count: log[0], cmt: log[1] } }
            //             })
            //             .catch(err => {
            //                 return err;
            //             })
            //     })
            // })
            // .then(doc => {
            //     return Promise.map(doc, p => {
            //         return app.models.social_like
            //             .getPostLike(p.post.id.toString())
            //             .then(log => {
            //                 return { ...p, like: log }
            //             })
            //             .catch(err => {
            //                 return err;
            //             })
            //     })
            // })
            .then(result => {
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, result);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
            })

    }
    Socialtimeline.remoteMethod("getTimeLine", {
        http: { path: "/getTimeLine", verb: "get" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "date", type: "string" },
            { arg: "limit", type: "number", default: 4 },
            { arg: "page", type: "number", default: 1 },
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
};
