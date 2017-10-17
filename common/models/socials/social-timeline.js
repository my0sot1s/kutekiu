'use strict';
const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const Promise = require("bluebird")


/**
 * 
 * @param {date} date 
 */
function dateProcess(date) {
    if (!date) date = new Date();
    var _date = new Date(date);
    if (typeof date.getMonth === 'function')
        return _date.toISOString().slice(0, 10).replace(/-/g, "");
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
        let _date = dateProcess(new Date().toDateString())
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
        if (!date) date = new Date();
        Socialtimeline
            .findOne({
                where: {
                    dateFlow: dateProcess(date.toDateString()),
                    // timeline: { "slice": -2 }
                }
            })
            .then(doc => {
                return Promise.map(doc.timeline.reverse(), post_id => {
                    return app.models.social_post.findById(post_id, {
                        fields: {
                            modified: false
                        }
                    })
                })
            })
            .then(posts => {
                return Promise.map(posts, value => {
                    return app.models.UserInfo.findById(value.user_id, {
                        fields: ["username", "displayName", "avatar"]
                    }).then(user => {
                        return { user, post: value }
                    })
                })
            })
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
