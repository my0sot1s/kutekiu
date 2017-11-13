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
                        { $push: { timeline: id.toString(), $position: 0 } })
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

    Socialtimeline.pre_getTimeLine = function (user_id, date, limit, page) {
        if (!date) date = new Date().toDateString();
        var str_date = dateProcess(date), skip = limit * (page - 1)
        let post_list_id = []
        // return Socialtimeline
        //     .find({
        //         where: {
        //             dateFlow: dateProcess(date),
        //             // timeline: { "slice": -2 }
        //             timeline: { slice: [0, 4] }
        //         },

        //     }, {})
        // .then(doc => {
        //     if (!doc) {
        //         cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, []);
        //         return;
        //     }
        //     else {
        //         // get all post
        //         /**
        //          * @property
        //          * request tới service marcarita lấy dữ liệu
        //          * - lấy 2comment + comment-count
        //          * - lấy  like count
        //          */
        //         // netw.sendToQueue(cst.PREFIX_SOURCES_QUEUE + "get2Comment"
        //         //     , { post_id: doc.timeline.reverse() });
        //         console.info("send to queue done!")
        //         post_list_id = doc.timeline.reverse();
        //         return doc.timeline.reverse()
        //     }
        // })
        // .then(doc => {
        //     // fetch all post trong post list
        //     //lấy ra toàn bộ post
        //     return Promise.map(doc, post_id => {
        //         return app.models.social_post.findById(post_id, {
        //             fields: {
        //                 modified: false
        //             }
        //         })
        //     })
        // })
        return app.models.social_post.find({
            // where: {
            //     created: { lte: new Date(date) },
            // },
            limit,
            skip: limit * (page - 1),
            fields: {
                modified: false
            },
            order: "created DESC"
        })
            .then(posts => {
                // dùng post để lấy người post
                // 
                let list_user = [];
                return Promise.map(posts, item => {
                    // return app.models.social_user.findOne({
                    //     where: { user_id: value.user_id },
                    //     fields: ["username", "displayName", "avatar"]
                    // }).then(user => {
                    //     return { user, post: value }
                    // }).catch(err => err)
                    list_user.push({ user_id: item.user_id })
                })
                    .then(() => {
                        return list_user.filter((value, index, self) =>
                            self.findIndex(t => { return value.user_id === t.user_id; }) === index)
                    })
                    .then(list_user => {
                        // lấy đc danh sách [{user_id}]
                        return app.models.social_user
                            .getUserInfoByListUser(list_user, ["user_id", "username", "displayName", "avatar"])
                            .then(user_info => {
                                return Promise.map(posts, (item) => {
                                    return app.models.social_user
                                        .findUser(item.user_id, user_info)
                                        .then(user => {
                                            return { user, post: item }
                                        })
                                })
                            })
                    })


            })
            // .then(post => {
            //     // return netw.listenAsync(cst.PREFIX_DESTINATIONS_QUEUE + "get2Comment").then(c => {
            //     //     return Promise.map(post, (value, index) => {
            //     //         return { ...value, ...c[index] }
            //     //     })
            //     // })
            //     return netw.listenAsync(cst.PREFIX_DESTINATIONS_QUEUE + "get2Comment").then(c => {
            //         return Promise.map(post, (value, index) => {
            //             return { ...value, ...c[index] }
            //         })
            //     })
            // })
            .then(doc => {
                return Promise.map(doc, p => {
                    return app.models.social_comments
                        .getDetailComment(p.post.id.toString())
                        .then(log => {
                            return { ...p, comment: { count: log[0], cmt: log[1] } }
                        })
                        .catch(err => {
                            return err;
                        })
                })
            })
            .then(doc => {
                return app.models.social_like
                    .getLikeByListPost(doc, user_id)
                // .then(ret => { })
                // .then()
            })
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

        // .then(result => {
        //     console.info("--get from queue done!");
        //     // chấm dứt nghe queue
        //     cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, result);
        // })
        // .catch(err => {
        //     return cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
        // })

    }
    Socialtimeline.getTimeLine = function (user_id, date, limit, page, cb) {
        Socialtimeline.pre_getTimeLine(user_id, date, limit, page)
            .then(result => {
                console.info("--get from queue done!");
                // chấm dứt nghe queue
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, result);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
            });

    }
    Socialtimeline.remoteMethod("getTimeLine", {
        http: { path: "/getTimeLine", verb: "get" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "user_id", type: "number" },
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
