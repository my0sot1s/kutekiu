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
    Socialalbums.addMedia = function (files) {
        let arrFiles = [];
        if (files) {
            files.map(value => {
                arrFiles.push(middleUploader(value.buffer));
            })
        } else {
            return Promise.reject(`No media added ^_^`);
        }
        return Promise.all(arrFiles)
            .then(log => {
                return Promise.map(log, value => {
                    return {
                        public_id: value.public_id,
                        width: value.width,
                        height: value.height,
                        format: value.format,
                        bytes: value.bytes,
                        url: value.url,
                    }
                })
            })
        // .then(media => {
        //     return Socialalbums.update({ id: req.body.id }, {
        //         modified: Date.now(),
        //         $push: { media: { $each: media } }
        //     })
        // })
    }
    Socialalbums.createAlbum = function (req, res, cb) {
        if (!req.body.user_id || !req.files || !req.files.length === 0)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            Socialalbums.addMedia(req.files)
                .then(media => {
                    return Socialalbums.create({
                        album_name: req.body.album_name,
                        author: req.body.user_id,
                        album_description: req.body.album_description,
                        album_media: media,
                        created: new Date(),
                        modified: new Date()
                    })
                }).then(res => {
                    cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, res);
                }).catch(err => {
                    cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                })
        }
    }
    Socialalbums.addMediaToAlbum = function (req, res, cb) {
        if (!req.body.user_id || !req.files || !req.files.length === 0)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            Socialalbums.addMedia(req.files)
                .then(media => {
                    return Socialalbums.update({ id: req.body.id }, {
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
        if (!req.body.user_id || !req.body.id || !req.files || !req.files.length === 0)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            Socialalbums.addMedia(req.files)
                .then(media => {
                    return Socialalbums.create({
                        album_name: req.body.album_name,
                        author: req.body.user_id,
                        album_description: req.body.album_description,
                        album_media: media,
                        created: new Date(),
                        modified: new Date()
                    })
                }).then(res => {
                    cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, res);
                }).catch(err => {
                    cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                })
        }
    }
    Socialalbums.updateAlbumInfo = function (user_id, id, album_name, album_description, cb) {
        if (!user_id || !id)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, "Không hợp lệ");
        else {
            return Socialalbums.update({ id }, {
                album_name,
                album_description,
                modified: new Date(),
            }).then(res => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, res);
            }).catch(err => {
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


