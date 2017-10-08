require('es6-promise').polyfill();
require('isomorphic-fetch');
const Promise = require('bluebird')

/**
 * fetch by get data
 * @param {string} url
 */
export default url => new Promise(function (resolve, reject) {
    fetch(url)
        .then(function (response) {
            if (response.status >= 400) {
                reject(new Error("Bad response from server"))
            }
            return response.json();
        })
        .then(function (stories) {
            resolve(stories);
        })
        .catch(err => reject(err));
})
/**
 * fetch send post data
 * @param {string} url 
 * @param {FormData} body 
 */
export const doPost = (url, body) =>
    new Promise(function (resolve, reject) {
        fetch(url, {
            // credentials: 'include', //pass cookies, for authentication
            method: 'POST',
            headers: {
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body
        })
            .then(function (response) {
                if (response.status >= 400) {
                    reject(new Error("Bad response from server"))
                }
                return response.json();
            })
            .then(function (stories) {
                resolve(stories);
            })
            .catch(err => reject(err));
    })
