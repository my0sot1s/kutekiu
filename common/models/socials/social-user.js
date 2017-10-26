'use strict';

const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const Promise = require("bluebird")

module.exports = function (Socialuser) {

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

};
