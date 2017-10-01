'use strict';

const cst = require("../../../utils/constants");
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 * 
 * 
 * @description - all remote method
 * GET getMusic /getMusic
 * GET getMusicById /getMusicById
 * POST createNewMusic /createNewMusic
 * PUT updateMusic /updateMusic
 * DELETE deleteMusic /deleteMusic
 */
module.exports = function (Music) {
    /**
        * @param {number} limit @default 5
        * @param {number} page @default 1
        * @param {function} cb
        */
    Music.getMusic = function (limit, page, cb) {
        Music.find(
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
    Music.getMusicById = function (id, cb) {
        Music.findById(id, {}, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * @param {string} id 
     * @param {function} cb
     */
    Music.likeUp = function (id, cb) {
        Music.update({ id }, { $inc: { like: 1 } }, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * @param {string} id 
     * @param {function} cb
     */
    Music.likeDown = function (id, cb) {
        Music.update({ id }, { $inc: { like: -1 } }, function (err, doc) {
            if (err) cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, cst.NULL_OBJECT);
            cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
        });
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * doc is a JSON.stringify
     * @param {string} name @required
     * @param {string} src @required
     * @param {number} like @rquired
     * @param {string} frame @rquired
     * @param {function} cb
     */
    Music.createNewMusic = function (name, src, like, frame, cb) {
        // parse to object

        const _frame = '<iframe src="{{src}}" width="620" height="312" frameborder="0" allowfullscreen></iframe>';
        Music.create({
            name, src, like: like ? like : 0,
            frame: frame ? frame : _frame, dateCreate: new Date()
        },
            function (err, doc) {
                if (err) cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
            })
    }
    /**
     * create new verb : POST
     * create new with accept string arg
     * @param {string} id  @required
     * @param {string} name @required
     * @param {string} src @required
     * @param {number} like @rquired
     * @param {string} frame @rquired
     * @param {function} cb
     */
    Music.updateMusic = function (id, name, src, like, frame, cb) {
        // parse to object
        let ndoc = { name, src, like, frame, dateCreate: new Date() };
        if (!name || name === "") delete ndoc.name;
        if (!like || like === 0) delete ndoc.like;
        if (!src || src === "") delete ndoc.src;
        if (!frame || frame === "") delete ndoc.frame;
        Music.update({ id }, ndoc)
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
    Music.deleteMusic = function (id, cb) {
        // parse to object
        Music.destroyById(id)
            .then(function () {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    Music.remoteMethod(
        "getMusic", {
            http: { path: "/getMusic", verb: "GET" },
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

    Music.remoteMethod(
        "getMusicById", {
            http: { path: "/getMusicById", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Music.remoteMethod(
        "createNewMusic", {
            http: { path: "/createNewMusic", verb: "POST" },
            accepts: [
                { arg: "name", type: "string", required: true },
                { arg: "src", type: "string" },
                { arg: "frame", type: "string" },
                { arg: "like", type: "number", default: 0 }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Music.remoteMethod(
        "likeUp", {
            http: { path: "/likeUp", verb: "ALL" },
            accepts: [
                { arg: "id", type: "string", required: true }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Music.remoteMethod(
        "likeDown", {
            http: { path: "/likeDown", verb: "ALL" },
            accepts: [
                { arg: "id", type: "string", required: true }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Music.remoteMethod(
        "updateMusic", {
            http: { path: "/updateMusic", verb: "PUT" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần update" },
                { arg: "name", type: "string", required: true },
                { arg: "src", type: "string" },
                { arg: "frame", type: "string" },
                { arg: "like", type: "number", default: 0 }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
    Music.remoteMethod(
        "deleteMusic", {
            http: { path: "/deleteMusic", verb: "DELETE" },
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
