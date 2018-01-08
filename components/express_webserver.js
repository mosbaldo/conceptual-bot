var express = require('express');
var bodyParser = require('body-parser');
var querystring = require('querystring');
var debug = require('debug')('botkit:webserver');

module.exports = function(controller, bot) {


    var webserver = express();
    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({ extended: true }));

    // import express middlewares that are present in /components/facebook/express_middleware
    /* var normalizedPath = require("path").join(__dirname, "express_middleware");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        require("./express_middleware/" + file)(webserver, controller);
    }); */

    webserver.use(express.static('public'));


    webserver.listen(process.env.PORT || 3000, null, function() {

        debug('Express webserver configured and listening at http://localhost:' + process.env.PORT || 3000);

    });

    // import all the pre-defined routes that are present in /components/facebook/routes
    var fbNormalizedPath = require("path").join(__dirname, "facebook/routes");
    require("fs").readdirSync(fbNormalizedPath).forEach(function(file) {
      require("./facebook/routes/" + file)(webserver, controller);
    });

    var slackNormalizedPath = require("path").join(__dirname, "slack/routes");
    require("fs").readdirSync(slackNormalizedPath).forEach(function(file) {
      require("./slack/routes/" + file)(webserver, controller);
    });

    controller.webserver = webserver;

    return webserver;

}
