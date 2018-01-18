'use strict';
var path    = require("path");

/**
 * setup graphql
 * @author te.ng - <manhte231@gmail.com> -
 */
function pt(relative) {
    return path.resolve(__dirname, '../..', relative);
}

const nw = require("../../utils/network")
require("../../utils/caching")
module.exports = function (server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  router.get('/ping', function(req, res) {
        res.sendFile(pt('client/index.html'));
    });
  // nw.rundemo()
  server.use(router);
};
