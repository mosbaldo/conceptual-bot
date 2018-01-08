module.exports = function(controller) {

    controller.on('user_channel_join,user_group_join', function(bot, message) {

        bot.reply(message, 'Welcome, <@' + message.user + '>');

    });

    // reply to a direct mention - @bot hello
    controller.on('direct_mention',function(bot,message) {
        // reply to _message_ by using the _bot_ object
        bot.reply(message,'I heard you mention me!');
    });

    // reply to a direct message
    controller.on('direct_message', function(bot,message) {
        // reply to _message_ by using the _bot_ object
        bot.reply(message, message.nlpResponse.result.fulfillment.messages[0].speech);
    });

}
