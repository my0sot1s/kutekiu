'use strict';

const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: "50mb" });
const { middlewareUpload, middleUploader, middleUploadDestroy, middleUploaderBas64FromBuffer } = require("../../../utils/upload")
const MAX_COUNT = 10;
const multerSingle = upload.single("file");
const multerArray = upload.array("file", MAX_COUNT);

module.exports = function (Upload) {


    Upload.beforeRemote("single", function (ctx, any, next) {
        multerSingle(ctx.req, ctx.res, next)
    })
    Upload.beforeRemote("multiples", function (ctx, any, next) {
        multerArray(ctx.req, ctx.res, next)
    })
    Upload.beforeRemote("uploadToUserAlbum", function (ctx, any, next) {
        multerArray(ctx.req, ctx.res, next)
    })
    Upload.destroy = function (id, cb) {
        middleUploadDestroy(id).then(log => {
            cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, log);
        }).catch(err => {
            cb(null, cst.FAILURE_CODE_CODE, cst.POST_FAILURE, err);
        })
    }
    Upload.single = function (req, res, cb) {
        middlewareUpload(req, res, function (err, result) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, result);
        })
        // middleUploaderBas64FromBuffer(req.file, res, function (err, result) {
        //     if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
        //     cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, result);
        // })
    }
    Upload.multiples = function (req, res, cb) {
        // middlewareUpload(req, res);
        let arrFiles = [];
        req.files.map(value => {
            arrFiles.push(middleUploader(value.buffer));
        })
        Promise.all(arrFiles).then(log => {
            return log
        }).then(log => {
            let l2 = log.map(value => {
                return {
                    public_id: value.public_id,
                    width: value.width,
                    height: value.height,
                    format: value.format,
                    bytes: value.bytes,
                    url: value.url,
                }
            })
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, l2);
        })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            })
    }

    Upload.uploadToUserAlbum = function (req, res, cb) {
        let folder = 'common'
        let album_name = 'common'
        let tag = ['uploaded']
        let files = req.files
        // if (!folder || folder === '' || folder === 'common') folder = 'common';
        // return getUserAlbum(user_id)
        //     .then(albumname => {
        //         if (!albumname) return Promise.reject(`Cannot find root user album`);
        //         else {
        //             if (!files)
        //                 return Promise.reject(`No media added ^_^`);
        //             else {
        //                 return files
        //             }
        //         }
        //     })
        Promise.resolve()
            .then(() => {
                return Promise.map(files, (file, index) => {
                    return middleUploaderBas64FromBuffer(file, `${album_name}/${folder}`, tags);
                })
            })
            .then(fileArray => {
                return Promise.all(fileArray)
                    .then(log => {
                        return log
                    })
            })
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
            }).then(f => {
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, f);
            }).catch(() => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            })
    }
    Upload.remoteMethod("single", {
        http: { path: "/single", verb: "POST" },
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
    Upload.remoteMethod("uploadToUserAlbum", {
        http: { path: "/uploadMedia", verb: "POST" },
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
    Upload.remoteMethod("destroy", {
        http: { path: "/destroy", verb: "POST" },
        accepts: [
            { arg: "id", type: "string", required: true }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Upload.remoteMethod("multiples", {
        http: { path: "/multiples", verb: "POST" },
        accepts: [
            { arg: 'req', type: 'object', 'http': { source: 'req' } },
            { arg: 'res', type: 'object', 'http': { source: 'res' } }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "array" }
        ]
    })
};
