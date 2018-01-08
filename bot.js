/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample multiplatform bot built with Botkit.

# RUN THE BOT:
  Follow the instructions here to set up your Facebook app and page:
    -> https://developers.facebook.com/docs/messenger-platform/implementation
  Run your bot from the command line:
    fb_page_token=<MY PAGE TOKEN> verify_token=<MY_VERIFY_TOKEN> node bot.js



~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var env = require('node-env-file');
env(__dirname + '/.env');

if (!process.env.slack_token) {
    console.log('Error: Specify Slack token in environment');
    slack_usage_tip();    
    process.exit(1);
}

if (!process.env.fb_page_token) {
    console.log('Error: Specify a Facebook fb_page_token in environment.');
    fb_usage_tip();
    process.exit(1);
}

if (!process.env.fb_verify_token) {
    console.log('Error: Specify a Facebook verify_token in environment.');
    fb_usage_tip();
    process.exit(1);
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');
var controllers = [];

// Create the Botkit fbController, which controls all instances of the bot.

var fbController = Botkit.facebookbot({
    debug: true,
    verify_token: process.env.fb_verify_token,
    access_token: process.env.fb_page_token,
    studio_token: process.env.studio_token,
    studio_command_uri: process.env.studio_command_uri,
});

var slackController = Botkit.slackbot({
    debug: true
});

var dialogflowMiddleware = require('botkit-middleware-dialogflow')({
    token: process.env.dialogflow,
});

var bot = slackController.spawn({
    token: process.env.slack_token
});

fbController.middleware.receive.use(dialogflowMiddleware.receive);

slackController.middleware.receive.use(dialogflowMiddleware.receive);

bot.startRTM();

// Log every message sent
slackController.middleware.send.use(function(bot, message, next) {
    // log it
    console.log('SENT: ', message);
    // modify the message
    message.logged = true;
    // continue processing the message
    next();
  });
  
  // Log every message recieved
  slackController.middleware.receive.use(function(bot, message, next) {
    // log it
    console.log('RECEIVED: ', message);
    // modify the message
    message.logged = true;
    // continue processing the message
    next();
  });
  

var normalizedPathS = require("path").join(__dirname, "skills/slack");
require("fs").readdirSync(normalizedPathS).forEach(function(file) {
  require("./skills/slack/" + file)(slackController);
});

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var facebookWebserver = require(__dirname + '/components/express_webserver.js')(fbController);

// Tell Facebook to start sending events to this application
require(__dirname + '/components/facebook/subscribe_events.js')(fbController);

// Set up Facebook "thread settings" such as get started button, persistent menu
require(__dirname + '/components/facebook/thread_settings.js')(fbController);

// Send an onboarding message when a user activates the bot
require(__dirname + '/components/facebook/onboarding.js')(fbController);

// Load in some helpers that make running Botkit on Glitch.com better
require(__dirname + '/components/facebook/plugin_glitch.js')(fbController);

// enable advanced botkit studio metrics
require('botkit-studio-metrics')(fbController);

var normalizedPathFb = require("path").join(__dirname, "skills/facebook");
require("fs").readdirSync(normalizedPathFb).forEach(function(file) {
  require("./skills/facebook/" + file)(fbController);
});

function fb_usage_tip() {
    console.log('~~~~~~~~~~');
    console.log('Botkit Studio Starter Kit');
    console.log('Execute your bot application like this:');
    console.log('fb_page_token=<MY PAGE TOKEN> verify_token=<MY VERIFY TOKEN> studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js');
    console.log('Get Facebook token here: https://developers.facebook.com/docs/messenger-platform/implementation')
    console.log('Get a Botkit Studio token here: https://studio.botkit.ai/')
    console.log('~~~~~~~~~~');
}

function slack_usage_tip() {
    console.log('~~~~~~~~~~');
    console.log('Botkit Starter Kit');
    console.log('Execute your bot application like this:');
    console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js');
    console.log('Get Slack app credentials here: https://api.slack.com/apps')
    console.log('Get a Botkit Studio token here: https://studio.botkit.ai/')
    console.log('~~~~~~~~~~');
}
