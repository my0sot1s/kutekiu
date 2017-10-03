require('es6-promise').polyfill();
require('isomorphic-fetch');
const Promise = require('bluebird')

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
        });
})
