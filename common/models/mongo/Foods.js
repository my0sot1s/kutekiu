'use strict';

const cst = require("../../../utils/constants");
const Promise = require("bluebird");
/**
 * @author te.ng - <manhte231@gmail.com>
 * 
 * 
 * @description - all remote method
 * GET getFoods /getFoods
 * GET getFoodsById /getFoodsById
 * POST createNewFoods /createNewFoods
 * PUT updateFoods /updateFoods
 * DELETE deleteFoods /deleteFoods
 */
module.exports = function (Foods) {

    /**
     * @param {number} limit @default 5
     * @param {number} page @default 1
     * @param {function} cb
     */
    Foods.getFoods = function (limit, page, cb) {
        Foods.find(
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
    Foods.getFoodsById = function (id, cb) {
        Foods.findById(id, {}, function (err, doc) {
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
    Foods.createNewFoods = function (title, link, tag, cb) {
        // parse to object
        Foods.create({ title, link, tag, price, fomular, dateCreate: new Date() }, function (err, doc) {
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
     * @param {string} fomular 
     * @param {number} price 
     * @param {string} tag 
     * @param {function} cb
     */
    Foods.updateFoods = function (id, title, link, price, fomular, tag, cb) {
        // parse to object
        let ndoc = { title, link, tag, price, fomular, dateCreate: new Date() };
        if (!title || title === "") delete ndoc.title;
        if (!link || link === "") delete ndoc.link;
        if (!tag || tag === "") delete ndoc.tag;
        if (!price || tag === "") delete ndoc.price;
        if (!fomular || fomular === "") delete ndoc.fomular;
        Foods.update({ id }, ndoc)
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
    Foods.deleteFoods = function (id, cb) {
        // parse to object
        Foods.destroyById(id)
            .then(function () {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, { id });
            })
            .catch(function (err) {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, cst.NULL_OBJECT);
            });
    }

    Foods.remoteMethod(
        "getFoods", {
            http: { path: "/getFoods", verb: "GET" },
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

    Foods.remoteMethod(
        "getFoodsById", {
            http: { path: "/getFoodsById", verb: "GET" },
            accepts: [
                { arg: "id", type: "string", required: true },
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Foods.remoteMethod(
        "createNewFoods", {
            http: { path: "/createNewFoods", verb: "POST" },
            accepts: [
                { arg: "title", type: "string", required: true },
                { arg: "link", type: "string", required: true },
                { arg: "tag", type: "string", required: true },
                { arg: "fomular", type: "string", description: "Công thức" },
                { arg: "price", type: "number", default: 0 }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" },
            ]
        });
    Foods.remoteMethod(
        "updateFoods", {
            http: { path: "/updateFoods", verb: "PUT" },
            accepts: [
                { arg: "id", type: "string", required: true, description: "ID của record cần update" },
                { arg: "title", type: "string" },
                { arg: "link", type: "string" },
                { arg: "tag", type: "string" },
                { arg: "fomular", type: "string", description: "Công thức" },
                { arg: "price", type: "number", default: 0 }
            ],
            returns: [
                { arg: "status", type: "number" },
                { arg: "message", type: "string" },
                { arg: "data", type: "object" }
            ]
        });
    Foods.remoteMethod(
        "deleteFoods", {
            http: { path: "/deleteFoods", verb: "DELETE" },
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
