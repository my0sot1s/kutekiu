'use strict';

const cst = require("../../../utils/constants");
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 * 
 * 
 * @description - all remote method
 * GET getStoriesContent /getStoriesContent
 * GET getStoriesContentById /getStoriesContentById
 * POST createNewStoriesContent /createNewStoriesContent
 * PUT updateStoriesContent /updateStoriesContent
 * DELETE deleteStoriesContent /deleteStoriesContent
 */
module.exports = function (StoriesContent) {

    /**
     * @param {number} limit @default 5
     * @param {number} page @default 0
     * @param {function} cb
     */
    StoriesContent.getStoriesContent = function (limit, page, cb) {
        StoriesContent.find(
            {
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
    StoriesContent.getStoriesContentById = function (id, cb) {
        StoriesContent.findById(id, {}, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * @param {string} id - stories id
     * @param {function} cb
     */
    StoriesContent.getStoriesContentByStoryId = function (id, cb) {
        StoriesContent.findOne({ where: { postId: id } }, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * doc is a JSON.stringify
     * @param {array} banner @required
     * @param {array} content 
     * @param {array} images 
     * @param {ObjectID} postId @required
     * @param {function} cb
     */
    StoriesContent.createNewStoriesContent = function (banner, content, images, postId, cb) {
        // parse to object
        StoriesContent.create({ banner, content, images, postId }, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
        })
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * @param {array} banner @required
     * @param {array} content 
     * @param {array} images 
     * @param {ObjectID} postId @required
     * @param {function} cb
     */
    StoriesContent.updateStoriesContent = function (id, banner, content, images, postId, cb) {
        // parse to object
        let ndoc = { banner, content, images, postId, dateCreate: new Date() };
        if (!banner || banner === "") delete ndoc.banner;
        if (!content || content === "") delete ndoc.content;
        if (!images || images === "") delete ndoc.images;
        if (!postId || postId === "") delete ndoc.postId;
        StoriesContent.update({ id }, ndoc)
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
    StoriesContent.deleteStoriesContent = function (id, cb) {
        // parse to object
        StoriesContent.destroyById(id)
            .then(function () {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    StoriesContent.remoteMethod(
        "getStoriesContent", {
            http: { path: "/getStoriesContent", verb: "GET" },
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

    StoriesContent.remoteMethod(
        "getStoriesContentById", {
            http: { path: "/getStoriesContentById", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    StoriesContent.remoteMethod(
        "getStoriesContentByStoryId", {
            http: { path: "/getStoriesContentByStoryId", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    StoriesContent.remoteMethod(
        "createNewStoriesContent", {
            http: { path: "/createNewStoriesContent", verb: "POST" },
            accepts: [
                { arg: "banner", type: "array" },
                { arg: "content", type: "array" },
                { arg: "images", type: "array" },
                { arg: "postId", type: "string", required: true },
                { arg: "tag", type: "string", required: true }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    StoriesContent.remoteMethod(
        "updateStoriesContent", {
            http: { path: "/updateStoriesContent", verb: "PUT" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần update" },
                { arg: "title", type: "string" },
                { arg: "link", type: "string" },
                { arg: "tag", type: "string" }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
    StoriesContent.remoteMethod(
        "deleteStoriesContent", {
            http: { path: "/deleteStoriesContent", verb: "DELETE" },
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
