'use strict';
const cst = require("../../../utils/constants");
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 *
 *
 * @description - all remote method
 * GET getPin /getPin
 * GET getPinById /getPinById
 * POST createNewPin /createNewPin
 * PUT updatePin /updatePin
 * DELETE deletePin /deletePin
 */
module.exports = function (Pin) {
    /**
     * @param {function} cb
     */
    Pin.getPin = function (cb) {
        Pin.find(
            {
                order: "created DESC",
            }, function (err, docs) {
                if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, docs);
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
    Pin.createNewPin = function (title, content, X, Y, cb) {
        // parse to object
        // content is required and not not nul
        if (!content || content === "")
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
        else
            Pin.create({ title, content, X, Y, created: new Date() }, function (err, doc) {
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
    Pin.updatePin = function (id, title, content, created, X, Y, cb) {
        // parse to object
        let ndoc = { title, content, X, Y, created: new Date() };
        if (!title || title === "") delete ndoc.title;
        if (!content || content === "") delete ndoc.content;
        if (!X || X === "") delete ndoc.X;
        if (!Y || Y === "") delete ndoc.Y;
        Pin.update({ id }, ndoc)
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
    Pin.deletePin = function (id, cb) {
        // parse to object
        Pin.destroyById(id)
            .then(function () {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    Pin.remoteMethod(
        "getPin", {
            http: { path: "/getPin", verb: "GET" },
            accepts: [
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "array" },
            ]
        });
    Pin.remoteMethod(
        "createNewPin", {
            http: { path: "/createNewPin", verb: "POST" },
            accepts: [
                { arg: "title", type: "string", required: true },
                { arg: "content", type: "string", required: true },
                { arg: "X", type: "string",  },
                { arg: "Y", type: "string",  }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Pin.remoteMethod(
        "updatePin", {
            http: { path: "/updatePin", verb: "PUT" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần update" },
                { arg: "title", type: "string" },
                { arg: "content", type: "string" },
                { arg: "X", type: "string" },
                { arg: "Y", type: "string" }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
    Pin.remoteMethod(
        "deletePin", {
            http: { path: "/deletePin", verb: "DELETE" },
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
