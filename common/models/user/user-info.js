'use strict';

const Promise = require("bluebird");

/**
 * @author te.ng - <manhte231@gmail.com>
 */
module.exports = function (UserInfo) {

    // disable default remote methods
    UserInfo.disableRemoteMethodByName('UserInfo.prototype.__count__accessTokens');
    UserInfo.disableRemoteMethodByName('UserInfo.prototype.__get__accessTokens');
    UserInfo.disableRemoteMethodByName('UserInfo.prototype.__create__accessTokens');
    UserInfo.disableRemoteMethodByName('UserInfo.prototype.__delete__accessTokens');
    UserInfo.disableRemoteMethodByName('UserInfo.prototype.__destroyById__accessTokens');
    UserInfo.disableRemoteMethodByName('UserInfo.prototype.__findById__accessTokens');
    UserInfo.disableRemoteMethodByName('UserInfo.prototype.__updateById__accessTokens');
}