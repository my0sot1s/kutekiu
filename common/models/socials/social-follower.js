'use strict';

/**
 * @author teng - <manhte231>
 * sức mạnh của mongo: ghi nhanh - đọc chậm.
 * mysql đọc nhanh - ghi chậm.
 */

const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const Promise = require("bluebird")

/**
 *
 * cấu trúc được quy định như sau:
 * own: - là user_id của chủ sở hữu.
 * follower - là user_id của những ng theo dõi own.
 * quan hệ: 1(own)----> n(follower)
 *
 *
 *
 *
 */
module.exports = function (Socialfollower) {

    /**
     * Lấy ra danh sách các người theo dõi bạn
     * lấy tất cả follower
     * @param {string} own - user_id của bạn
     */
    Socialfollower.allFollowers = function (own) {
        return Socialfollower.find({
            where: {
                own
            },
            order: "created DESC",
            fields: "follower",
        })
    }
    /**
     * Lấy ra danh sách các người bạn đang theo dõi
     */
    Socialfollower.allOwn = function (user_id) {
        return Socialfollower.find({
            where: {
                follower: user_id
            },
            order: "created DESC",
            fields: "own",
        })
    }
    /**
     * Tiến hành follow user_id
     * @param {number} own - id của user được follow
     * @param {number} user_id - id của user bấm follow
     */
    Socialfollower.doFollow = function (own, user_id) {
        return Socialfollower.findOrCreate({
            own,
            follower: user_id,
        }, {
            own,
            follower: user_id,
            created: new Date()
        })
        // return Socialfollower.create({
        //     own,
        //     follower: user_id,
        //     created: new Date()
        // })
    }
    /**
     * kiêm tra quan hệ follow user_id và own
     * @param {number} own - id của user được follow
     * @param {number} user_id - id của user bấm follow
     * @return {1} own -> user_id @description tôi follow user_id
     * @return {0} own <-> user_id @description chúng tôi là bạn
     * @return {2} user_id -> own @description  user_id follow tôi
     * @return {-1} own x user_id  @description không quen biêt
     * @return {-2} lỗi hệ thống
     */
    Socialfollower.isFollow = function (own, user_id) {
        /**
         * với 1 lượt truy vấn.
         * nếu array
         * =2 bạn bè.
         * =1 -> process.
         * =0 || null -> ko có quan hệ
         */
        return Socialfollower.find(
            {
                where: {
                    or: [
                        {
                            own,
                            follower: user_id
                        },
                        {
                            own: user_id,
                            follower: own
                        }
                    ]
                }
            }
        ).then(doc => {
            if (!doc || doc.length === 0) return -1
            else {
                let len = doc.length;
                if (len === 1)
                    return own === doc[0].own ? 1 : 2;
                else if (len === 2) return 0;
                else {
                    console.error(`Chương trình gặp trục trặc dữ liệu với 2 user: ${user_id} + ${own}`)
                    return -1;
                }
            }
        }).catch(err => {
            console.error(`Quá trình phát sinh lỗi.`)
            return -2;
        })
    }
    // /**
    // * @param {number} own - id của user được follow
    // * @param {number} user_id - id của user bấm follow
    // */
    // Socialfollower.unfollow = function (own, user_id) {
    //     return Socialfollower.isFollow(own, user_id)
    //         .then(doc => {
    //             if (doc) {
    //                 return Socialfollower.destroyAll({
    //                     own,
    //                     follow: user_id
    //                 })
    //                     .then(ok => { return true })
    //                     .catch(err => { return false })
    //             }
    //             else {
    //                 return false;
    //             }
    //         })
    // }
};
