'use strict';


/**
 * @author te.ng   - <manhte231>
 */
const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const Promise = require("bluebird");
const netw = require("../../../utils/network")
const ObjectID = require("mongodb").ObjectID;


module.exports = function (Socialcomments) {
    Socialcomments.getAllComments = function (post_id, limit, page, cb) {
        Socialcomments.find({
            where: {
                post_id: new ObjectID(post_id),
            }
        })
            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
            })
    }
        Socialcomments.getCommentCount = function (post_id) {
            return Socialcomments.count({ post_id: new ObjectID(post_id) })
        }

    Socialcomments.getDetailComment = function (post_id) {
        return Promise.all([
            Socialcomments.getCommentCount(post_id),
            Socialcomments.get2Comment(post_id)
        ])
    }


    Socialcomments.get2Comment = function (post_id) {

        return Socialcomments.find({
            where: {
                post_id: new ObjectID(post_id)
            },
            order: "created DESC",
            limit: 2,
            fields: {
                post_id: false
            }
        }).then(doc => {
            return Promise.map(doc, v => {
                return app.models.social_user.findOne(
                    {
                        where: {
                            user_id: v.user_id
                        },
                        fields: ["displayName", "avatar"]
                    })
                    .then(pim => {
                        return { data: v, user: pim }
                    })
            })
        })
    }
    Socialcomments.addComment = function (user_id, post_id, comment, cb) {
        Socialcomments.create({
            user_id,
            post_id: new ObjectID(post_id),
            content: comment,
            created: new Date()
        })
            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
            })
    }
    /**
     * work with queue
     */

    // netw.listenMessage(cst.PREFIX_SOURCES_QUEUE + "get2Comment", (params) => {
    //     if (params.post_id && Array.isArray(params.post_id)) {
    //         Promise.map(params.post_id, p_id => {
    //             return Socialcomments.get2Comment(p_id)
    //         })
    //             .then(doc => {
    //                 return netw.sendToQueue(cst.PREFIX_DESTINATIONS_QUEUE + "get2Comment", doc)
    //             }).catch(err => {
    //                 console.error(err);
    //             })
    //     } else console.error("Định dạng message? Lỗi")
    // })
    Socialcomments.remoteMethod("addComment", {
        http: { path: "/add-comment", verb: "post" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "user_id", type: "number", required: true },
            { arg: "post_id", type: "string", required: true },
            { arg: "comment", type: "string", required: true }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Socialcomments.remoteMethod("getAllComments", {
        http: { path: "/all-comments", verb: "get" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "post_id", type: "string", required: true },
            { arg: "limit", type: "number" },
            { arg: "page", type: "number" }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "array" }
        ]
    })
};
