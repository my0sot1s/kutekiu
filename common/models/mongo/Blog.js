'use strict';
const cst = require("../../../utils/constants");
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 * 
 * 
 * @description - all remote method
 * GET getBlog /getBlog
 * GET getBlogById /getBlogById
 * POST createNewBlog /createNewBlog
 * PUT updateBlog /updateBlog
 * DELETE deleteBlog /deleteBlog
 */
module.exports = function (Blog) {
    /**
     * @param {number} limit @default 5
     * @param {number} page @default 0
     * @param {function} cb
     */
    Blog.getBlog = function (limit, page, cb) {
        Blog.find(
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
     * @param {number} limit @default 5
     * @param {number} page @default 0
     * @param {function} cb
     */
    Blog.getBlogInfo = function (limit, page, cb) {
        Blog.find(
            {
                order: "dateCreate DESC",
                skip: limit && page ? limit * page : 0,
                limit
            }, function (err, docs) {
                var doc2 = [];
                docs.map(value => {
                    doc2.push(delete value.content);
                })
                if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc2);
            });
    }
    /**
     * @param {string} id 
     * @param {function} cb
     */
    Blog.getBlogById = function (id, cb) {
        Blog.findById(id, {}, function (err, doc) {
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
     * @param {string} content @required
     * @param {string} tag @rquired
     * @param {function} cb
     */
    Blog.createNewBlog = function (title, link, tag, content, cb) {
        // parse to object
        // content is required and not not nul
        if (!content || content === "")
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
        else
            Blog.create({ title, link, tag, content, dateCreate: new Date() }, function (err, doc) {
                if (err) cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
            });
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * @param {string} id  @required
     * @param {string} title 
     * @param {string} link 
     * @param {string} tag 
     * @param {string} content
     * @param {function} cb
     */
    Blog.updateBlog = function (id, title, link, content, cb) {
        // parse to object
        let ndoc = { title, link, tag, content, dateCreate: new Date() };
        if (!title || title === "") delete ndoc.title;
        if (!link || link === "") delete ndoc.link;
        if (!tag || tag === "") delete ndoc.tag;
        if (!content || content === "") delete ndoc.content;
        Blog.update({ id }, ndoc)
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
    Blog.deleteBlog = function (id, cb) {
        // parse to object
        Blog.destroyById(id)
            .then(function () {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    Blog.remoteMethod(
        "getBlog", {
            http: { path: "/getBlog", verb: "GET" },
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
    Blog.remoteMethod(
        "getBlogInfo", {
            http: { path: "/getBlogInfo", verb: "GET" },
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

    Blog.remoteMethod(
        "getBlogById", {
            http: { path: "/getBlogById", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Blog.remoteMethod(
        "createNewBlog", {
            http: { path: "/createNewBlog", verb: "POST" },
            accepts: [
                { arg: "title", type: "string", required: true },
                { arg: "link", type: "string", required: true },
                { arg: "content", type: "string", required: true },
                { arg: "tag", type: "string", required: true }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Blog.remoteMethod(
        "updateBlog", {
            http: { path: "/updateBlog", verb: "PUT" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần update" },
                { arg: "title", type: "string" },
                { arg: "link", type: "string" },
                { arg: "content", type: "string" },
                { arg: "tag", type: "string" }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
    Blog.remoteMethod(
        "deleteBlog", {
            http: { path: "/deleteBlog", verb: "DELETE" },
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
