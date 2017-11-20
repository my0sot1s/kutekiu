'use strict';
/**
 * 
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */
const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const Promise = require("bluebird")
const ObjectID = require("mongodb").ObjectID;

module.exports = function (Sociallike) {

    /**
     * lấy lượt like của từng post.
     * Ý tưởng dùng xử lý logic để giảm số lượt query và đọc io.
     * @param {[{user:{},post:{post_id:string},comment:{}}]} - list_post 
     * @param {[{user:{},post:{post_id:string},comment:{},like:number,liked?:boolean}]} - list_post 
     */
    Sociallike.getLikeByListPost = function (list_post, user_id) {
        return Promise.map(list_post, (item, index) => {
            // get list post_id
            item.like = 0;
            return item.post.id;
        }).then(items => {
            return Promise.map(items, item => {
                return { post_id: item }
            })
        }).then(query => {
            return Sociallike.find({
                where: {
                    or: query
                },
                fields: ['user_id', 'post_id']
            })
        }).then(doc => {
            /**
             * độ phức tạp là On^2
             */
            return Promise.map(list_post, post_doc => {

                return Promise.map(doc, like_doc => {
                    if (post_doc.post.id.toHexString() === like_doc.post_id.toHexString()) {
                        post_doc.like++;
                    }
                    if (user_id === like_doc.user_id && post_doc.post.id.toHexString() === like_doc.post_id.toHexString()) {
                        post_doc.liked = true;
                    }
                })
            })
        })
            .then(() => { return list_post; })
            .catch(err => {
                console.info(err);
            })
    }

    Sociallike.deleteAllLikeOfPost = function () {
        return Sociallike.destroyAll({
            post_id: new ObjectID(post_id)
        })
    }

    Sociallike.getPostLike = function (post_id) {
        return Sociallike.count({
            post_id: new ObjectID(post_id)
        })
    }
    Sociallike.getPost_like = function (post_id, cb) {
        Sociallike.getPostLike(post_id)
            .then(num => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, num);
            }).catch(err => { cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err); })
    }
    Sociallike.hitLike = function (post_id, user_id, cb) {
        Sociallike.findOne({
            where: {
                post_id: new ObjectID(post_id),
                user_id,// người like post
            }
        })
            .then(doc => {
                if (!doc)
                    return Sociallike.create({
                        post_id: new ObjectID(post_id),
                        user_id,// người like post
                        created: new Date()
                    })
                else
                    return Sociallike.destroyById(doc.id.toHexString())

            })
            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
            }).catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
            })
    }
    // Sociallike.unlike = function (post_id, user_id, cb) {
    //     Sociallike.destroyAll({
    //         post_id: new ObjectID(post_id), user_id
    //     }).then(doc => {
    //         cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, cst.NULL_OBJECT);
    //     }).catch(err => {
    //         cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
    //     })
    // }

    Sociallike.remoteMethod("getPostLike", {
        http: { path: "/get_post_like", verb: "POST" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "post_id", type: "string", required: true, description: "Post_id" }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Sociallike.remoteMethod("hitLike", {
        http: { path: "/hitLike", verb: "POST" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "post_id", type: "string", required: true, description: "post_id" },
            { arg: "user_id", type: "string", required: true, description: "user_id" }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    // Sociallike.remoteMethod("unlike", {
    //     http: { path: "/unlike", verb: "POST" },
    //     description: "Sử dụng qua post man",
    //     accepts: [
    //         { arg: "post_id", type: "string", required: true, description: "Post_id" },
    //         { arg: "user_id", type: "string", required: true, description: "user_id" }
    //     ],
    //     returns: [
    //         { arg: "status", type: "number" },
    //         { arg: "message", type: "string" },
    //         { arg: "data", type: "object" }
    //     ]
    // })
};
