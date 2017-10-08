'use strict';


const cst = require("../../../utils/constants");
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 * 
 * 
 * @description - all remote method
 * GET getImage /getImage
 * GET getImageById /getImageById
 * POST createNewImage /createNewImage
 * PUT updateImage /updateImage
 * DELETE deleteImage /deleteImage
 */

module.exports = function (Image) {

    /**
     * @param {number} limit @default 5
     * @param {number} page @default 1
     * @param {function} cb
     */
    Image.getImage = function (limit, page, cb) {
        Image.find(
            {
                order: "dateCreate DESC",
                skip: limit && page ? limit * page : 0,
                limit
            }, function (err, docs) {
                if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, docs);
            });
    }
    /**
     * @param {string} id 
     * @param {function} cb
     */
    Image.getImageById = function (id, cb) {
        Image.findById(id, {}, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * doc is a JSON.stringify
     * @param {string} title @required
     * @param {string} link @required
     * @param {string} tag @rquired
     * @param {function} cb
     */
    Image.createNewImage = function (title, link, tag, cb) {
        // parse to object
        Image.create({ title, link, tag, dateCreate: new Date() })
            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
            }).catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            })
    }
    /**
 * create new verb : POST
 * create new with accept string arg
 * doc is a JSON.stringify
 * @param {string} title @required
 * @param {string} links @required
 * @param {string} tag @rquired
 * @param {function} cb
 */
    Image.createMany = function (title, link, tag, cb) {
        // parse to object
        var createStack = [];
        link.map(data => {
            createStack.push(Image.create({ title, data, tag, dateCreate: new Date() }))
        });
        Promise.all(createStack)
            .then(function (docs) {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, docs)
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT)
            })
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * @param {string} id  @required
     * @param {string} title 
     * @param {string} link 
     * @param {string} tag 
     * @param {function} cb
     */
    Image.updateImage = function (id, title, link, tag, cb) {
        // parse to object
        let ndoc = { title, link, tag, dateCreate: new Date() };
        if (!title || title === "") delete ndoc.title;
        if (!link || link === "") delete ndoc.link;
        if (!tag || tag === "") delete ndoc.tag;
        Image.update({ id }, ndoc)
            .then(function (doc) {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }
    /**
     * delete new verb : DELETE
     * delete new with accept string arg
     * @param {string} id  @required
     * @param {function} cb
     */
    Image.deleteImage = function (id, cb) {
        // parse to object
        Image.destroyById(id)
            .then(function () {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    Image.remoteMethod(
        "getImage", {
            http: { path: "/getImage", verb: "GET" },
            accepts: [
                { arg: "limit", type: "number", default: 5 },
                { arg: "page", type: "number", default: 0 },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "array" },
            ]
        });

    Image.remoteMethod(
        "getImageById", {
            http: { path: "/getImageById", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Image.remoteMethod(
        "createNewImage", {
            http: { path: "/createNewImage", verb: "POST" },
            accepts: [
                { arg: "title", type: "string", required: true },
                { arg: "link", type: "string", required: true },
                { arg: "tag", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Image.remoteMethod(
        "createMany", {
            http: { path: "/createMany", verb: "POST" },
            accepts: [
                { arg: "title", type: "string", required: true },
                { arg: "link", type: "array", required: true, description: "Ảnh là mảng chứa ảnh" },
                { arg: "tag", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Image.remoteMethod(
        "updateImage", {
            http: { path: "/updateImage", verb: "PUT" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần update" },
                { arg: "title", type: "string" },
                { arg: "link", type: "string" },
                { arg: "tag", type: "string" },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
    Image.remoteMethod(
        "deleteImage", {
            http: { path: "/deleteImage", verb: "DELETE" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần delete" }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
};
