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
const { middleUploadDestroy, uploadToUserAlbum } = require("../../../utils/upload");
const MAX_COUNT = 10;
const multerArray = upload.array("file", MAX_COUNT);

module.exports = function (Socialalbums) {
    /**
     *  @param {[file]} req.files
     */
    Socialalbums.beforeRemote("createAlbum", function (ctx, any, next) {
        // đẩy nội dung media vào req
        multerArray(ctx.req, ctx.res, next)
    });
    /**
     *  @param {[file]} req.files
     */
    Socialalbums.beforeRemote("addMediaToAlbum", function (ctx, any, next) {
        // đẩy nội dung media vào req
        multerArray(ctx.req, ctx.res, next)
    });
    // .then(media => {
    //     return Socialalbums.update({ id: req.body.id }, {
    //         modified: Date.now(),
    //         $push: { media: { $each: media } }
    //     })
    // })
    Socialalbums.createAlbum = function (req, res, cb) {
        if (!req.body.album_name || !req.body.user_id || !req.files || !req.files.length === 0)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            uploadToUserAlbum(req.files, req.body.user_id, req.body.album_name, req.body.tags)
                .then(media => {
                    return Socialalbums.create({
                        album_name: req.body.album_name,
                        author: req.body.user_id,
                        album_description: req.body.album_description,
                        album_media: media,
                        created: new Date(),
                        modified: new Date()
                    })
                })
                .then(res => {
                    cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, res);
                })
                .catch(err => {
                    cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                })
        }
    }
    Socialalbums.addMediaToAlbum = function (req, res, cb) {
        if (!req.body.id || !req.body.album_name || !req.body.user_id || !req.files || !req.files.length === 0)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            uploadToUserAlbum(req.files, req.body.user_id, req.body.album_name)
                .then(media => {
                    return Socialalbums.updateAll({ id: req.body.id }, {
                        modified: Date.now(),
                        $push: { media: { $each: media } }
                    })
                }).then(res => {
                    cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, res);
                }).catch(err => {
                    cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                })
        }
    }
    Socialalbums.updateAlbum = function (req, res, cb) {
        if (!req.body.album_name || !req.body.user_id || !req.body.id || !req.files || !req.files.length === 0)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            uploadToUserAlbum(req.files, req.body.user_id, req.body.album_name)
                .then(media => {
                    return Socialalbums.create({
                        album_name: req.body.album_name,
                        author: req.body.user_id,
                        album_description: req.body.album_description,
                        album_media: media,
                        created: new Date(),
                        modified: new Date()
                    })
                })
                .then(res => {
                    cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, res);
                })
                .catch(err => {
                    cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                })
        }
    }
    Socialalbums.updateAlbumInfo = function (user_id, id, album_name, album_description, cb) {
        if (!user_id || !id)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            return Socialalbums.updateAll({ id }, {
                album_name,
                album_description,
                modified: new Date(),
            })
                .then(res => {
                    cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, res);
                })
                .catch(err => {
                    cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                })
        }
    }
    Socialalbums.deleteAlbum = function (user_id, id, cb) {
        if (!user_id || !id)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            return Socialalbums.findById(id)
                .then(doc => {
                    // xóa media nếu có
                    if (doc.album_media.length > 0 && user_id === doc.author)
                        return Promise.map(doc.album_media, value => {
                            // xóa trong kho
                            return middleUploadDestroy(value.public_id)
                        })
                    else cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Xóa lỗi | Không có quyền xóa");
                })
                .then(doc => {
                    return Socialalbums.destroyById(id)
                })
                .then(log => {
                    cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, res);
                }).catch(err => {
                    cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                })
        }
    }
    Socialalbums.getAlbumImages = function (album_id) {
        Socialalbums.findById(album_id)
            .then(log => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, log);
            }).catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
            })
    }
    Socialalbums.getListAlbumByUser = function (user_id) {
        Socialalbums.find({
            where: {
                author: user_id
            },
            fields: ["album_name", "album_description", "created"]
        })
            .then(log => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, log);
            }).catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
            })
    }


    Socialalbums.remoteMethod("getAlbumImages", {
        http: { path: "/get-albums", verb: "GET" },
        accepts: [
            { arg: "album_id", type: "string", required: true },
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Socialalbums.remoteMethod("getListAlbumByUser", {
        http: { path: "/get-list-albums", verb: "GET" },
        accepts: [
            { arg: "user_id", type: "number", required: true },
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Socialalbums.remoteMethod("createAlbum", {
        http: { path: "/create-album", verb: "POST" },
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
    Socialalbums.remoteMethod("addMediaToAlbum", {
        http: { path: "/add-media", verb: "POST" },
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
    Socialalbums.remoteMethod("updateAlbumInfo", {
        http: { path: "/update-album-info", verb: "POST" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "user_id", type: "number", required: true },
            { arg: "id", type: "string", required: true },
            { arg: "album_name", type: "string" },
            { arg: "album_description", type: "string" },
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Socialalbums.remoteMethod("deleteAlbum", {
        http: { path: "/del-album", verb: "DELETE" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: "user_id", type: "number", required: true },
            { arg: "id", type: "string", required: true },
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
};


