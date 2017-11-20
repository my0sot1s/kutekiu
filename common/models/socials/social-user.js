'use strict';

const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const multer = require("multer");
const storage = multer.memoryStorage();
const Promise = require("bluebird")
const upload = multer({ storage, limits: "50mb" });
const { uploadToUserAlbum, middleUploadDestroy } = require("../../../utils/upload")
const MAX_COUNT = 10;
const multerArray = upload.array("file", MAX_COUNT);

module.exports = function (Socialuser) {


    /**
     * @desc - Cho vào danh sách user_id và chỉ đọc database 1 lần
     * @param {[number]} - list_user [user_id:15,'user_id':16]
     */
    Socialuser.getUserInfoByListUser = function (list_user, array_field) {
        if (!array_field)
            array_field = ["username", "displayName", "avatar"]
        return Socialuser.find({
            where: {
                or: list_user
            },
            fields: array_field
        })
    }
    /**
         * @desc - Cho vào danh sách user_id và chỉ đọc database 1 lần
         * @param {[number]} - list_user [user_id:15,'user_id':16]
         */
    Socialuser.findUser = function (user_id, list_user) {
        let userSelection = {}
        return Promise.map(list_user, user => {
            if (user.user_id === user_id) userSelection = user;
        }).then(() => {
            return userSelection
        })
    }


    Socialuser.createSocialUser = function (user, username, email, cb) {
        app.models.social_user.create(
            {
                user_id: user.userId,
                username,
                email,
                created: user.created,
                album_name: `@${username}_${user.userId}`
            }
        )
            .then(doc => cb(null, user))
            .catch(err => cb(err, null))
    }
    /**
    *  @param {[file]} req.files
    */
    Socialuser.beforeRemote("updateSocialUser", function (ctx, any, next) {
        // đẩy nội dung media vào req
        multerArray(ctx.req, ctx.res, next)
    })
    Socialuser.updateSocialUser = function (req, res, cb) {
        if (!req.body.user_id || !req.body.displayName)
            cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, `không đúng định dạng`);
        else
            /**
            * @param {array} log
            */
            uploadToUserAlbum(req.files, req.body.user_id, `common`)
                .then(media => {
                    return Promise.all([
                        app.models.social_user.updateAll({ user_id: Number(req.body.user_id) }, {
                            displayName: req.body.displayName,
                            banner: media[1].url,
                            avatar: media[0].url,
                        }),
                        app.models.UserInfo.updateAll({ id: Number(req.body.user_id) }, {
                            displayName: req.body.displayName
                        })
                    ])
                })
                .then(log => {
                    cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, log);
                })
                .catch(function (err) {
                    cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
                });

    }
    Socialuser.remoteMethod("updateSocialUser", {
        http: { path: "/update-social-user", verb: "POST" },
        description: "Sử dụng qua post man",
        accepts: [
            { arg: 'req', type: 'object', 'http': { source: 'req' } },
            { arg: 'res', type: 'object', 'http': { source: 'res' } }
        ],
        returns: [
            { arg: "status", type: "number" },
            { arg: "message", type: "string" },
            { arg: "data", type: "object" }
        ]
    })
    /**
     * 
     * get by user_id
     * @param {number} - user_id
     * @param {array} - array_field
     * @return theo số lượng field
     * @using by comment
     */
    Socialuser.getByUser_id = function (user_id, array_field) {
        if (!array_field)
            array_field = ["username", "displayName", "avatar"]
        return Socialuser.findOne(
            {
                where: {
                    user_id
                },
                fields: array_field
            })
    }
    /**
     * 
     * get by username
     * @param {username} - user_id
     * @param {array} - array_field
     * @return theo số lượng field
     * @using by comment
     */
    Socialuser.getByUser_name = function (username, array_field) {
        username = username.trim()
        if (!array_field)
            array_field = ["username", "displayName", "avatar"]
        return Socialuser.findOne(
            {
                where: {
                    username
                },
                fields: array_field
            })
    }

};
