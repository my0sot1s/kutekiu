
/**
 * kết nối tới rabbitmq
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */


const imgur = require('imgur');
const Promise = require("bluebird");
const IMGUR = {
    UNE: 'tcrm95',
    PWD: "95manhte",
    app_name: "cms_node",
    client_secret: "0c9c2abebac47e3c6921af2029391545828f8b65",
    client_id: "33bfe818cbde10a",
    album_id: "d3H2I"
}

// user:tcrm95
// pw:95manhte
imgur.setCredentials(IMGUR.UNE, IMGUR.PWD, IMGUR.client_id);
// A single image


/**
 * Create an album
 * @returns {promise}
 */
function createAlbum() {
    return new Promise(function (resolve, reject) {
        imgur.createAlbum()
            .then(function (json) {
                console.log(json);
            })
            .catch(function (err) {
                console.error(err.message);
            });
    })
}

/**
 * Upload a url
 * @param   {string}  url - address to an image on the web
 * @param   {string=} albumId - the album id to upload to
 * @returns {promise}
 */
function zEuploadByUrl(url, album_id) {
    if (/^(\.png)|(\.jpg)|(\.jpge)/.test(url))
        return new Promise(function (resolve, reject) {
            imgur.uploadUrl(url, album_id)
                .then(function (json) {
                    resolve(json);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    else return Promise.reject("Not accept format");
}

/**
 * Upload a Base64-encoded string
 * @link http://en.wikipedia.org/wiki/Base64
 * @param   {string} base64 - a base-64 encoded string
 * @param   {string=} albumId - the album id to upload to
 * @returns {promise} - on resolve, returns the resulting image object from imgur
 */
function zEuploadBase64(base64, albumId) {
    albumId = !albumId ? IMGUR.album_id : albumId;
    if (/[A-Za-z0-9+/=]*/.test(base64))
        return new Promise(function (resolve, reject) {
            imgur.uploadBase64(base64, albumId)
                .then(function (json) {
                    console.log(json.data.link);
                })
                .catch(function (err) {
                    console.error(err.message);
                });
        });
    else return Promise.reject("Not accept format");
}
/**
 * 
 * @param {string} path - Có thể là 1 file or nhiều file nên có thể là 1 regex
 * @param {string} album_id - @default IMGUR.album_id
 */
function zEuploadImage(path, album_id) {
    if (!album_id) album_id = IMGUR.album_id;
    return new Promise(function (resolve, reject) {
        // demopath:__dirname + '/../binbim.jpg'
        imgur.uploadFile(path, album_id)
            .then(function (json) {
                resolve(json);
            })
            .catch(function (err) {
                reject(err)
            });
    })
}

/**
 * Delete image
 * @param {string} deletehash - deletehash of the image generated during upload
 * @returns {promise}
 */
function zEdeleteImage(deletehash) {
    return new Promise(function (resolve, reject) {
        // demopath:__dirname + '/../binbim.jpg'
        imgur.deleteImage(deletehash)
            .then(function (json) {
                resolve(json);
            })
            .catch(function (err) {
                reject(err)
            });
    })
}
/**
 * Upload an entire album of images
 * @param   {Array} images - array of image strings of desired type
 * @param   {string} uploadType - the type of the upload ('File', 'Url', 'Base64')
 * @param   {boolean=} failSafe - if true, it won't fail on invalid or empty image input and will return an object with empty album data and an empty image array
 * @returns {promise} - on resolve, returns an object with the album data and and an array of image data objects {data: {...}, images: [{...}, ...]}
 */
function zEuploadAlbum(images, uploadType) {
    return new Promise(function (resolve, reject) {
        imgur.uploadAlbum(images, uploadType)
            .then(function (album) {
                resolve(album);
            })
            .catch(function (err) {
                console.error(err);
            });
    })
}
// uploadImage();


module.exports = {
    createAlbum,
    uploadByUrl: zEuploadByUrl,
    uploadBase64: zEuploadBase64,
    uploadImage: zEuploadImage,
    deleteImage: zEdeleteImage,
    uploadAlbum: zEuploadAlbum,
}