'use strict';

const cst = require("../../../utils/constants");
const app = require('../../../server/server')
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 * 
 * 
 * @description - all remote method
 * GET getStories /getStories
 * GET getStoriesById /getStoriesById
 * POST createNewStories /createNewStories
 * PUT updateStories /updateStories
 * DELETE deleteStories /deleteStories
 */
module.exports = function (Stories) {

    /**
     * @param {number} limit @default 5
     * @param {number} page @default 1
     * @param {function} cb
     */
    Stories.getStories = function (limit, page, cb) {
        Stories.find(
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
    Stories.getStoriesById = function (id, cb) {
        Stories.findById(id, {}, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * doc is a JSON.stringify
     * @param {string} titles @required
     * @param {string} author 
     * @param {string} begin 
     * @param {number} views @default 
     * @param {number} liked @default 
     * @param {string} userId 
     * @param {array} banner 
     * @param {function} cb
     */
    Stories.createNewStories = function (titles, author, begin, views, liked, userId, banner, cb) {
        // parse to object
        Stories.create({ titles, author, begin, views, liked, userId, banner, dateCreate: new Date() }, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
        })
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * @param {string} id  @required
     * @param {string} titles 
     * @param {string} author 
     * @param {string} begin 
     * @param {number} views 
     * @param {number} liked 
     * @param {string} userId 
     * @param {array} banner 
     * @param {function} cb
     */
    Stories.updateStories = function (id, title, link, tag, cb) {
        // parse to object
        let ndoc = { titles, author, begin, views, liked, userId, banner, dateCreate: new Date() };
        if (!titles || titles === "") delete ndoc.titles;
        if (!author || author === "") delete ndoc.author;
        if (!begin || begin === "") delete ndoc.begin;
        if (!views || views === "") delete ndoc.views;
        if (!liked || liked === "") delete ndoc.liked;
        if (!userId || userId === "") delete ndoc.userId;
        if (!banner || banner === "") delete ndoc.banner;
        Stories.update({ id }, ndoc)
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
    Stories.deleteStories = function (id, cb) {
        // parse to object
        Stories.destroyById(id)
            .then(function () {
                // xóa bản ghi tham chiếu tại StoriesContent
                app.models.StoriesContent.destroyAll({ where: { postId: id } }, function (err, info) {
                    if (err) cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
                    else cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
                })
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    Stories.remoteMethod(
        "getStories", {
            http: { path: "/getStories", verb: "GET" },
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

    Stories.remoteMethod(
        "getStoriesById", {
            http: { path: "/getStoriesById", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Stories.remoteMethod(
        "createNewStories", {
            http: { path: "/createNewStories", verb: "POST" },
            accepts: [
                { arg: "titles", type: "string", },
                { arg: "author", type: "string", },
                { arg: "begin", type: "string", },
                { arg: "views", type: "number", },
                { arg: "liked", type: "number", },
                { arg: "userId", type: "number", },
                { arg: "banner", type: "array", }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Stories.remoteMethod(
        "updateStories", {
            http: { path: "/updateStories", verb: "PUT" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần update" },
                { arg: "titles", type: "string", },
                { arg: "author", type: "string", },
                { arg: "begin", type: "string", },
                { arg: "views", type: "number", },
                { arg: "liked", type: "number", },
                { arg: "userId", type: "number", },
                { arg: "banner", type: "array", }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
    Stories.remoteMethod(
        "deleteStories", {
            http: { path: "/deleteStories", verb: "DELETE" },
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
