'use strict';

const zEupload = require("../../../utils/upload");
const app = require("../../../server/server");
module.exports = function (Upload) {


    Upload.naturalUpload = function (files, cb) {

    }
    /**
     * @param {[string]} files
     * @param {cb} cb
     */
    Upload.base64Upload = function (files, cb) {

        if (Array.isArray(files)) {
            let len = files.length, info = [];
            for (var i = 0; i < len; i++) {
                zEupload.uploadBase64(files[i]).then((doc) => {
                    info.push(doc);
                }).err(err => {
                    info.push(err);
                    throw new Error(err);
                });
                cb(null, 200, "SUCCESS", info)
            }
        }
        else {
            zEupload.uploadBase64(files).then((doc) => {
                cb(null, 200, "SUCCESS", [doc])
            }).err(err => {
                cb(null, 201, "FALSE", [err]);
            });

        }
    }

    Upload.beforeRemote("naturalUpload", function (ctx, model, next) {
        // let { files } = ctx.req.body;
        console.log(ctx.args.file.toString())
        let buf = new Buffer(ctx.args.file, "binary")

        var ll = buf.toString("base64");
        zEupload.uploadBase64(buf)
            .then(data => {

            })
            .catch(err => {

            })

    });

    Upload.remoteMethod("naturalUpload", {
        http: { path: "/upload", verb: "POST" },
        accepts: [
            { arg: 'file', type: 'file', http: { source: 'body' }, required: true }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    Upload.remoteMethod("base64Upload", {
        http: { path: "/base64upload", verb: "POST" },
        accepts: [
            { arg: "files", type: "array" }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "array" }
        ]
    })
};
