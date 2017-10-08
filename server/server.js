'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
const multer = require("multer");
const bodyParser = require("body-parser");
require("dotenv").config({ path: __dirname + "/../.env" });

var app = module.exports = loopback();

/**
 * @author te.nguyen - <manhte231>
 * note: issuse at : https://stackoverflow.com/questions/28523782/how-can-i-use-body-parser-with-loopback
 */

app.use(bodyParser.json({ "limit": "50mb" })); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, "limit": "50mb" })); // for parsing application/x-www-form-urlencoded
// app.use(multer()); // for parsing multipart/form-data
app.start = function () {
    // start the web server
    return app.listen(function () {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});
