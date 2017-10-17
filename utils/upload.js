/**
 * 
 * 
 * @author te.ng - <manhte231>
 * 
 * create upload
 */

const Promise = require("bluebird");
const cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * upload single file
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function middlewareUpload(req, res, next) {
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
    return new Promise(function (resolve, reject) {
        cloudinary.v2.uploader.upload_stream((err, result) => {
            if (err) reject(err)
            else resolve(result)
        }).end(buffer);
    })
}
/**
 * upload using buffer
 * @param {string} public_id 
 */
function middleUploadDestroy(public_id) {
    return new Promise(function (resolve, reject) {
        cloudinary.v2.uploader.destroy(public_id,
            function (error, result) {
                if (error) reject(error);
                else resolve(result)
            });
    })
}
module.exports = {
    middlewareUpload,
    middleUploader,
    middleUploadDestroy
}