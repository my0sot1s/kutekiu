'use strict';

const cst = require("../../../utils/constants");
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 * 
 * 
 * @description - all remote method
 * GET getCenter /getCenter
 * GET getCenterById /getCenterById
 * POST createNewCenter /createNewCenter
 * PUT updateCenter /updateCenter
 * DELETE deleteCenter /deleteCenter
 */
module.exports = function (Center) {

    /**
     * @param {number} limit @default 5
     * @param {number} page @default 1
     * @param {function} cb
     */
    Center.getCenter = function (limit, page, cb) {
        Center.find(
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
    Center.getCenterById = function (id, cb) {
        Center.findById(id, {}, function (err, doc) {
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
    Center.createNewCenter = function (title, link, tag, cb) {
        // parse to object
        Center.create({ title, link, tag, dateCreate: new Date() }, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
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
    Center.updateCenter = function (id, title, link, tag, cb) {
        // parse to object
        let ndoc = { title, link, tag, dateCreate: new Date() };
        if (!title || title === "") delete ndoc.title;
        if (!link || link === "") delete ndoc.link;
        if (!tag || tag === "") delete ndoc.tag;
        Center.update({ id }, ndoc)
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
    Center.deleteCenter = function (id, cb) {
        // parse to object
        Center.destroyById(id)
            .then(function () {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    Center.remoteMethod(
        "getCenter", {
            http: { path: "/getCenter", verb: "GET" },
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

    Center.remoteMethod(
        "getCenterById", {
            http: { path: "/getCenterById", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Center.remoteMethod(
        "createNewCenter", {
            http: { path: "/createNewCenter", verb: "POST" },
            accepts: [
                { arg: "title", type: "string", required: true },
                { arg: "link", type: "string", required: true },
                { arg: "tag", type: "string", required: true }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Center.remoteMethod(
        "updateCenter", {
            http: { path: "/updateCenter", verb: "PUT" },
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
    Center.remoteMethod(
        "deleteCenter", {
            http: { path: "/deleteCenter", verb: "DELETE" },
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
