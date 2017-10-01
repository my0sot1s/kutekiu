'use strict';

const cst = require("../../../utils/constants");
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 * 
 * 
 * @description - all remote method
 * GET getNotes /getNotes
 * GET getNotesById /getNotesById
 * POST createNewNotes /createNewNotes
 * PUT updateNotes /updateNotes
 * DELETE deleteNotes /deleteNotes
 */
module.exports = function (Notes) {
    /**
            * @param {number} limit @default 5
            * @param {number} page @default 1
            * @param {function} cb
            */
    Notes.getNotes = function (limit, page, cb) {
        Notes.find(
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
    Notes.getNotesById = function (id, cb) {
        Notes.findById(id, {}, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * @param {string} id 
     * @param {number} positionX 
     * @param {number} positionY
     * @param {function} cb
     */
    Notes.changeLocation = function (id, positionX, positionY, cb) {
        Notes.update({ id }, { positionX, positionY }, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * doc is a JSON.stringify
     * @param {string} content  @required
     * @param {string} title  @required
     * @param {function} cb
     */
    Notes.createNewNotes = function (title, content, cb) {
        // parse to object

        Notes.create({
            title, content, dateCreate: new Date()
        },
            function (err, doc) {
                if (err) cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
            })
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * @param {string} content  @required
     * @param {string} title  @required
     * @param {function} cb
     */
    Notes.updateNotes = function (id, title, content, cb) {
        // parse to object
        let ndoc = { title, content, dateCreate: new Date() };
        if (!title || title === "") delete ndoc.title;
        if (!content || content === 0) delete ndoc.content;
        Notes.update({ id }, ndoc)
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
    Notes.deleteNotes = function (id, cb) {
        // parse to object
        Notes.destroyById(id)
            .then(function () {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    Notes.remoteMethod(
        "getNotes", {
            http: { path: "/getNotes", verb: "GET" },
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

    Notes.remoteMethod(
        "getNotesById", {
            http: { path: "/getNotesById", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Notes.remoteMethod(
        "createNewNotes", {
            http: { path: "/createNewNotes", verb: "POST" },
            accepts: [
                { arg: "title", type: "string", required: true },
                { arg: "content", type: "string" }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Notes.remoteMethod(
        "changeLocation", {
            http: { path: "/changeLocation", verb: "ALL" },
            accepts: [
                { arg: "id", type: "string", required: true },
                { arg: "posstionX", type: "number", required: true },
                { arg: "posstionY", type: "number", required: true }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Notes.remoteMethod(
        "updateNotes", {
            http: { path: "/updateNotes", verb: "PUT" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần update" },
                { arg: "title", type: "string", required: true },
                { arg: "content", type: "string" }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
    Notes.remoteMethod(
        "deleteNotes", {
            http: { path: "/deleteNotes", verb: "DELETE" },
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
