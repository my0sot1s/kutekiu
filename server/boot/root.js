'use strict';

/**
 * setup graphql
 * @author te.ng - <manhte231@gmail.com> -
 */


const nw = require("../../utils/network")
module.exports = function (server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  // nw.rundemo()
  server.use(router);
};
