'use strict';

const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: "50mb" });
const { middlewareUpload } = require("../../../utils/upload")
const MAX_COUNT = 10;
const multerSingle = multer().single("file");
const multerArray = multer().array("files", MAX_COUNT);

module.exports = function (Upload) {


    Upload.beforeRemote("single", function (ctx, any, next) {
        multerSingle(ctx.req, ctx.res, next)
    })
    Upload.beforeRemote("multiples", function (ctx, any, next) {
        multerArray(ctx.req, ctx.res, next)
    })
    Upload.single = function (req, res, cb) {
        middlewareUpload(req, res, function (err, result) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, result);
        })
    }
    Upload.multiples = function (req, res, cb) {
        // middlewareUpload(req, res);
        cb(null, cst.FAILURE_CODE, "NOT YET", cst.NULL_OBJECT);
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
