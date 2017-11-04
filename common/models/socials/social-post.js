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

/**
 * @author te.ng   - <manhte231>
 * create post.
 * update post
 * delete post
 * 
 * change media port
 */
module.exports = function (Socialpost) {
    /**
    *  @param {[file]} req.files
    */
    Socialpost.beforeRemote("createPost", function (ctx, any, next) {
        // đẩy nội dung media vào req
        multerArray(ctx.req, ctx.res, next)
    })

    Socialpost.getPostById = function (post_id, cb) {
        Socialpost.findById(post_id, {
            fields: {
                modified: false,
            }
        })
            .then(doc => {
                return app.models.social_user
                    .getByUser_id(doc.user_id, ["username", "displayName", "avatar"])
                    .then(user => {
                        return { user, post: doc }
                    })
            })
            .then(sss => {
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, sss);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
            })
    }
    Socialpost.getPost = function (user_id, limit, page, cb) {
        Promise.all([
            app.models.social_user
                .getByUser_id(user_id, ["username", "displayName", "avatar", "banner"]),
            Socialpost.find({
                where: {
                    "user_id": user_id
                },
                order: "created DESC",
                skip: limit && page ? limit * page : 0,
                limit,
                fields: {
                    modified: false,
                }
            })
        ])
            .spread((user, post) => ({ user, post }))
            .then(doc => {
                return Promise.map(doc.post, p => {
                    return app.models.social_comments
                        .getDetailComment(p.id.toString())
                        .then(log => {
                            return { post: p, comment: { count: log[0], cmt: log[1] } }
                        })
                        .catch(err => {
                            return err;
                        })
                })
                    .then(doc2 => {
                        return Promise.map(doc2, (p, index) => {
                            return app.models.social_like
                                .getPostLike(p.post.id.toString())
                                .then(log => {
                                    return { ...p, like: log }
                                })
                                .catch(err => {
                                    return err;
                                })
                        })
                    })
                    .then(data => {
                        return { user: doc.user, data }
                    })
            })

            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
            })
    }

    Socialpost.getUserPost = function (username, limit, page, cb) {
        app.models.social_user
            .getByUser_name(username, ["user_id", "displayName", "avatar", "banner"])
            .then(user => {
                return Socialpost.find({
                    where: {
                        "user_id": user.user_id
                    },
                    order: "created DESC",
                    skip: limit && page ? limit * page : 0,
                    limit,
                    fields: {
                        modified: false,
                    }
                }).then(post => {
                    return { post, user }
                })
            }).then(doc => {
                return Promise.map(doc.post, p => {
                    return app.models.social_comments
                        .getDetailComment(p.id.toString())
                        .then(log => {
                            return { post: p, comment: { count: log[0], cmt: log[1] } }
                        })
                        .catch(err => {
                            return err;
                        })
                })
                    .then(doc2 => {
                        return Promise.map(doc2, (p, index) => {
                            return app.models.social_like
                                .getPostLike(p.post.id.toString())
                                .then(log => {
                                    return { ...p, like: log }
                                })
                                .catch(err => {
                                    return err;
                                })
                        })
                    })
                    .then(data => {
                        return { user: doc.user, data }
                    })
            })

            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
            })
    }
    /**
     *  @param {object} req.body
     *  @param {number|string} req.body.user_id
     *  @param {string} req.body.post_content
     *  @param {[file]} req.files
     *  @param {buffer} req.files[i].buffer
     * 
     *  b1: upload 
     *  b2: lấy kq ném vao media
     */
    Socialpost.createPost = function (req, res, cb) {
        let arrFiles = [];
        if (!req.body.user_id) {
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không có xác thực"); return;
        }
        if (!req.files || req.files.length === 0) {
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không có media"); return;
        }
        if (req.files) {
            req.files.map(value => {
                arrFiles.push(middleUploader(value.buffer));
            })
        } else {
            Socialpost.create({
                user_id: req.body.user_id,
                post_content: req.body.post_content,
                created: Date.now(),
                modified: Date.now(),
                media: []
            }).then(doc => {
                app.models.social_timeline.pushTimeline(doc.id)
                    .then(log => {
                        cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
                    })
                    .catch(err => {
                        cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                    })
            }).catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
            })
        }
        /**
         * @param {array} log
         */
        Promise.all(arrFiles)
            .then(log => {
                return Promise.map(log, value => {
                    return {
                        public_id: value.public_id,
                        signature: value.signature,
                        width: value.width,
                        height: value.height,
                        format: value.format,
                        bytes: value.bytes,
                        url: value.url
                    }
                })
            })
            .then(media => {
                return Socialpost.create({
                    user_id: req.body.user_id,
                    post_content: req.body.post_content,
                    created: Date.now(),
                    modified: Date.now(),
                    media
                })
            })
            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
                // app.models.social_timeline.pushTimeline(doc.id)
                //     .then(log => {
                //         cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
                //     })
                //     .catch(err => {
                //         cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                //     })
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
            })
    }
    /**
     * Xóa post
     * xóa image trong store 
     * xóa post
     */
    Socialpost.delPost = function (post_id, cb) {
        // tìm post
        Socialpost.findById(post_id)
            .then(doc => {
                // xóa media nếu có
                if (doc.media.length > 0)
                    return Promise.map(doc.media, value => {
                        // xóa trong kho
                        return middleUploadDestroy(value.public_id)
                    })
                else cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            }).then(log => {
                // xóa post
                return Socialpost.destroyById(post_id)
            })
            .then(log => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { post_id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }
    Socialpost.remoteMethod("createPost", {
        http: { path: "/create-post", verb: "POST" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: 'req', type: 'object', 'http': { source: 'req' } },
            { arg: 'res', type: 'object', 'http': { source: 'res' } }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Socialpost.remoteMethod("delPost", {
        http: { path: "/del-post", verb: "DELETE" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "post_id", type: "string", required: true },
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Socialpost.remoteMethod("getPost", {
        http: { path: "/get-post", verb: "get" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "user_id", type: "number", required: true },
            { arg: "limit", type: "number", default: 5 },
            { arg: "page", type: "number", default: 0 },
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Socialpost.remoteMethod("getPostById", {
        http: { path: "/get-post-by-id", verb: "get" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "post_id", type: "string", required: true }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Socialpost.remoteMethod("getUserPost", {
        http: { path: "/get-user-post", verb: "get" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "username", type: "string", required: true },
            { arg: "limit", type: "number", default: 5 },
            { arg: "page", type: "number", default: 0 }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
};
