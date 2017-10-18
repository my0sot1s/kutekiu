'use strict';

/**
 * @author te.ng   - <manhte231>
 */
const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const Promise = require("bluebird")

module.exports = function (Socialcomment) {

    Socialcomment.getComments = function (post_id, cb) {
        Socialcomment.find({
            where: {
                post_id
            }
        })
            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
            })
    }
    Socialcomment.get2Comment = function (post_id, cb) {

        Socialcomment.find({
            where: {
                post_id
            },
            order: "created DESC",
            limit: 2
        })
            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
            })
    }
    Socialcomment.addComment = function (user_id, post_id, comment, cb) {
        Socialcomment.create({
            user_id,
            post_id,
            content: comment,
            created: new Date()
        })
            .then(doc => {
                cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
            })
            .catch(err => {
                cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
            })
    }
};
