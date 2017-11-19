/**
 * 
 * 
 * @author tenguyen - <manhte231>
 * 
 * @prop: mục đích là nhằm xác thực và kiểm tra người dùng token có là user
 * đó ko.
 * 
 */
const app = require("../server/server");

async function authenMiddleWare(user_id, access_token) {
    return await app.models.AccessToken
        .findOne({
            where: {
                id: access_token,
                userId: user_id
            }
        })
        .then(doc => {
            if (!doc) return false;
            else return true
        })
}
function getUserAlbum(user_id) {
    return app.models.social_user
        .findOne({
            where: {
                user_id
            },
            fields: ['album_name']
        })
        .then(doc => {
            if (!doc) return null;
            else return doc.album_name
        })
}
module.exports = {
    getUserAlbum
}