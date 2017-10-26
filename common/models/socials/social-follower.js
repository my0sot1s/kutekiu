'use strict';

/**
 * @author teng - <manhte231>
 */

const app = require("../../../server/server");
const cst = require("../../../utils/constants")
const Promise = require("bluebird")

module.exports = function (Socialfollower) {

    /**
     * Lấy ra danh sách các người theo dõi bạn
     */
    Socialfollower.allFollowers = function (own) {
        return Socialfollower.find({
            where: {
                own
            },
            order: "created DESC"
        })
    }
    /**
     * Lấy ra danh sách các người bạn đang theo dõi
     */
    Socialfollower.allFollowers = function (user_id) {
        return Socialfollower.find({
            where: {
                follow: user_id
            },
            order: "created DESC"
        })
    }
    /**
     * Tiến hành follow user_id
     * @param {number} own - id của user được follow 
     * @param {number} user_id - id của user bấm follow 
     */
    Socialfollower.addFollower = function (own, user_id) {
        return Socialfollower.create({
            own,
            follower: user_id,
            created: new Date()
        })
    }
    /**
     * kiêm tra quan hệ follow user_id và own
     * @param {number} own - id của user được follow 
     * @param {number} user_id - id của user bấm follow 
     * @return {1} own -> user_id @description tôi follow user_id
     * @return {0} own <-> user_id @description chúng tôi là bạn
     * @return {2} user_id -> own @description  user_id follow tôi
     * @return {-1} own x user_id  @description không quen biêt
     */
    Socialfollower.isFollow = function (own, user_id) {
        let social = -1;
        return Socialfollower.findOne(
            {
                where: {
                    own,
                    follower: user_id
                }
            }
        ).then(doc => {
            // nếu tôi có follow bạn
            if (doc) {
                social = 1
                return Socialfollower.findOne({
                    own: user_id,
                    follower: own
                })
                    .then(ok => {
                        // neu ban cũng follow tôi
                        if (ok)
                            return 0
                        // bạn ko follow tôi
                        else return social;
                    })
            }
            else
                // tôi ko follow bạn
                return Socialfollower.findOne({
                    own: user_id,
                    follower: own
                })
                    .then(ok => {
                        // bạn follow tôi
                        if (ok)
                            return 2
                        // bạn ko follow tôi => chúng ta ko quen nhau
                        else return social;
                    })
        }).catch(err => {
            debugger
        })
    }
    /**
    * @param {number} own - id của user được follow 
    * @param {number} user_id - id của user bấm follow 
    */
    Socialfollower.unfollow = function (own, user_id) {
        return Socialfollower.isFollow(own, user_id)
            .then(doc => {
                if (doc) {
                    return Socialfollower.destroyAll({
                        own,
                        follow: user_id
                    })
                        .then(ok => { return true })
                        .catch(err => { return false })
                }
                else {
                    return false;
                }
            })
    }
};
