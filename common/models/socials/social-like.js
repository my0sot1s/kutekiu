'use strict';
/**
 * 
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */
const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const multer = require("multer");
const storage = multer.memoryStorage();
const Promise = require("bluebird")
const upload = multer({ storage, limits: "50mb" });
const { middlewareUpload, middleUploader, middleUploadDestroy } = require("../../../utils/upload")
const MAX_COUNT = 10;
const multerArray = upload.array("file", MAX_COUNT);

module.exports = function (Sociallike) {

    Sociallike.getPostLike = function (id, cb) {
        Sociallike.find({
            where: {
                post_id: id
            }
        }).then(doc => {
            cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { count: doc });
        })
    }
    Sociallike.hitLike = function (post_id, user_id, cb) {
        Sociallike.update({
            where: {
                post_id
            }
        }, { $inc: { count: 1 }, $push: { user_id } }).then(doc => {
            cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, cst.NULL_OBJECT);
        }).catch(err => {
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
        })
    }
    Sociallike.unlike = function (post_id, user_id, cb) {
        Sociallike.update({
            where: {
                post_id
            }
        }, { $inc: { count: -1 } }).then(doc => {
            cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, cst.NULL_OBJECT);
        }).catch(err => {
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
        })
    }

    Sociallike.remoteMethod("getPostLike", {
        http: { path: "/get_post_like", verb: "POST" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "id", type: "string", required: true, description: "Post_id" }
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
            { arg: "post_id", type: "string", required: true, description: "Post_id" },
            { arg: "user_id", type: "string", required: true, description: "user_id" }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Sociallike.remoteMethod("unlike", {
        http: { path: "/unlike", verb: "POST" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "post_id", type: "string", required: true, description: "Post_id" },
            { arg: "user_id", type: "string", required: true, description: "user_id" }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
};
