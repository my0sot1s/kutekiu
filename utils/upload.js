// import { Buffer } from "buffer";

/**
 *
 *
 * @author te.ng - <manhte231>
 *  * @prop unused
 * create upload
 */

const Promise = require("bluebird");
const Buffer = require('buffer').Buffer;
const cloudinary = require("cloudinary");


const runConfig = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}
const getUserAlbum = require("./authentication").getUserAlbum;


/**
 * upload single file
 *
 *
 * @prop unused
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function middlewareUpload(req, res, next) {
    runConfig()
    cloudinary.v2.uploader.upload_stream((err, result) => {
        if (err) next(err, null)
        else next(null, result);
    }).end(req.file.buffer);
}
/**
 * upload using buffer
 * @param {Buffer} buffer
 */
function middleUploader(buffer) {
    runConfig()
    return new Promise(function (resolve, reject) {
        cloudinary.v2.uploader.upload_stream((err, result) => {
            if (err) reject(err)
            else resolve(result)
        }).end(buffer);
    })
}
/**
 * upload using buffer
 *
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


function uploadToUserAlbum(files, user_id, folder, tags) {
    runConfig()
    if (!folder || folder === "" || folder === 'common') folder = 'common';
    return getUserAlbum(user_id)
        .then(album_name => {
            if (!album_name) return Promise.reject(`Cannot find root user album`);
            else {
                if (!files)
                    return Promise.reject(`No media added ^_^`);
                else {
                    return Promise.map(files, (file, index) => {
                        return middleUploaderBas64FromBuffer(file, `${album_name}/${folder}`, tags);
                    }).then(fileArray => {
                        return Promise.all(fileArray)
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
                    })
                }
            }
        })
}
// uploadWithHttpUrl(`https://cdn01.muaban.net/images/thumb-detail/201704/22/921/059ccac5991d4c50b2702202994b1875.jpg`,
//     `test`);

const videoUpload = function (file, folder = `video`, tags) {
    runConfig()
    let base64 =
        file.buffer.toString("base64")
        , base64Header = `data:${file.mimetype};base64,`;
    return new Promise(function (resolve, reject) {
        cloudinary.v2.uploader
            .upload(`${base64Header}${base64}`,
                {
                    folder: `${folder}`,
                    tags: tags ? tags : [],
                    resource_type: "video"
                },
                (err, result) => {
                    if (err) reject(err)
                    else resolve(result)
                })
    })
}
module.exports = {
    middlewareUpload,
    middleUploader,
    middleUploadDestroy,
    uploadWithHttpUrl,
    middleUploaderBas64FromBuffer,
    uploadToUserAlbum,
    videoUpload
}
