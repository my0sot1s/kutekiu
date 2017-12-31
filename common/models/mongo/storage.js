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
const upload = multer({storage, limits: "50mb"});
const MAX_COUNT = 10;
const multerArray = upload.array("file", MAX_COUNT);
const Buffer = require('buffer').Buffer;
const cloudinary = require("cloudinary");

const runConfig = () => {
    cloudinary.config({
        cloud_name: `dux5eshko`,
        api_key: `582134397711936`,
        api_secret: `9vSYLXE7w-aOVFwAMKirXwCOzEs`
    });
}

/**
 * upload using buffer
 * @param {File} file
 */
function middleUploaderBas64FromBuffer(file, folder, tags) {
    runConfig()
    let base64 =
        file.buffer.toString("base64")
        , base64Header = `data:${file.mimetype};base64,`;
    return new Promise(function (resolve, reject) {
        cloudinary.v2.uploader
            .upload(`${base64Header}${base64}`,
                {
                    folder: `${folder}`,
                    tags: tags ? tags : []
                },
                (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                })
    })
}
/**
 * upload using buffer
 * @param {string} public_id
 */
function middleUploadDestroy(public_id) {
    runConfig()
    return new Promise(function (resolve, reject) {
        cloudinary.v2.uploader.destroy(public_id,
            function (error, result) {
                if (error) reject(error);
                else resolve(result)
            });
    })
}
function uploadWithHttpUrl(url, folder, tags) {
    runConfig()
    return new Promise(function (resolve, reject) {
        cloudinary.v2.uploader.upload(url,
            {
                folder: `${folder}`,
                tags
            },
            function (error, result) {
                if (error) reject(error);
                else resolve(result)
            });
    })
}

module.exports = function (Storage) {

    /**
     * upload
     */
    Storage.beforeRemote("upload", function (ctx, any, next) {
        // đẩy nội dung media vào req
        multerArray(ctx.req, ctx.res, next)
    })

    Storage.upload = function (req, res, cb) {
        /**
         * @param {array} log
         */
        Promise.map(req.files, (file, index) => {
            return middleUploaderBas64FromBuffer(file, `common`)
                .then(media => {
                    return {
                        public_id: media.public_id,
                        size: media.bytes,
                        format: media.format,
                        url: media.url
                    }
                })
        })
            .then(media => {
                return Storage.create({
                    created: Date.now(),
                    media
                }).then(doc => {
                    cb(null, 200, `Upload success`, doc)
                }).catch(err => {
                    cb(null, 400, `Upload false`, err)
                })
            })
            .catch(err => {
                cb(null, 400, `Upload false`, err)
            })
    }
    Storage.remoteMethod("upload", {
        http: {path: "/upload", verb: "POST"},
        description: "Sử dụng qua post man",
        accepts: [
            {arg: 'req', type: 'object', 'http': {source: 'req'}},
            {arg: 'res', type: 'object', 'http': {source: 'res'}}
        ],
        returns: [
            {arg: "status", type: "number"},
            {arg: "message", type: "string"},
            {arg: "data", type: "object"}
        ]
    })


    Storage.delete = function (id, cb) {
        // tìm post
        Storage.findById(id)
            .then(doc => {
                // xóa media nếu có
                if (doc.media.length > 0)
                    return Promise.map(doc.media, value => {
                        // xóa trong kho
                        return middleUploadDestroy(value.public_id)
                    })
                else cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, `không có media`);
            })
            .then(log => {
                return Storage.destroyById(id)
            })
            .then(log => {
                // xóa post
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, {id});
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
            });
    }
    Storage.remoteMethod("delete", {
        http: {path: "/delete", verb: "DELETE"},
        description: "Sử dụng qua post man",
        accepts: [
            {arg: "id", type: "string", required: true},
        ],
        returns: [
            {arg: "status", type: "number"},
            {arg: "message", type: "string"},
            {arg: "data", type: "object"}
        ]
    })

    Storage.uploadWithUrl = function (url, cb) {
        uploadWithHttpUrl(url,'common')
            .then(media => {
                return Storage.create({
                    created: Date.now(),
                    media: [{
                        public_id: media.public_id,
                        size: media.bytes,
                        format: media.format,
                        url: media.url
                    }]
                })
            })
            .then(doc => {
                cb(null, 200, `Upload success`, doc)
            })
            .catch(err => {
                cb(null, 400, `Upload false`, err)
            })
    }
    Storage.remoteMethod("uploadWithUrl", {
        http: {path: "/uploadWithUrl", verb: "POST"},
        accepts: [
            {arg: 'url', type: 'string', required: true}
        ],
        returns: [
            {arg: "status", type: "number"},
            {arg: "message", type: "string"},
            {arg: "data", type: "object"}
        ]
    })

}
