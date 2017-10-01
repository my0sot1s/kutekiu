'use strict';

/**
 * setup graphql
 * @author te.ng - <manhte231@gmail.com> -
 */

module.exports = function (server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());

  server.use(router);
  require("../../utils/upload");
};
