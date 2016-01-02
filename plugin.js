var moment = require('moment');

var WibblePlugin = {
    init: function(client, imports) {

        var wibbleWobbleJellyCache = [];

        var wibbleConfig = client.config("wibble");
        if (!wibbleConfig || !wibbleConfig.expires) {
            throw Error("tennu-wibble: is missing some or all of its configuration.");
        }

        function WibbleWobbleCheck(IRCMessage) {

                if (['wibble','wobble','jelly'].indexOf(IRCMessage.message.toLowerCase()) === -1) {
                    return;
                }

                var currentverb = IRCMessage.message.toLowerCase();
                var existingRequest = wibbleWobbleJellyCache[IRCMessage.nickname.toLowerCase()];

                var response = '';

                // Expire out an old verb
                if (existingRequest && (moment().subtract(wibbleConfig.expires, 'seconds')) > existingRequest.timestamp) {
                    existingRequest.lastSaidVerb = 'jelly';
                }

                if (currentverb === 'wibble' && (!existingRequest || existingRequest.lastSaidVerb === 'jelly')) {
                    response = 'wobble';
                }
                else if (currentverb === 'wobble' && existingRequest.lastSaidVerb === 'wibble') {
                    response = 'jelly';
                }
                else if (currentverb === 'jelly' && existingRequest.lastSaidVerb === 'wobble') {
                    response = 'Now you\'re getting it!';
                }
                else if (currentverb === 'jelly' && existingRequest.lastSaidVerb === 'wobble') {
                    response = 'Now you\'re getting it!';
                }

                if (response !== '') {
                    // Update the user/verb store                
                    wibbleWobbleJellyCache[IRCMessage.nickname.toLowerCase()] = {
                        timestamp: moment(),
                        lastSaidVerb: currentverb
                    };

                    return response;
                }
        }

        return {
            handlers: {
                "privmsg": WibbleWobbleCheck,
            }
        };

    }
};

module.exports = WibblePlugin;