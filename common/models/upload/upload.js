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
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, log);
        }).catch(err => {
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
