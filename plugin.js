var moment = require('moment');

const requiresAdminHelp = "Requires admin privileges.";

var WibblePlugin = {
    requiresRoles: ["admin"],
    init: function(client, imports) {

        var wibbleWobbleJellyCache = [];

        var wibbleConfig = client.config("wibble");
        if (!wibbleConfig || !wibbleConfig.expires) {
            throw Error("tennu-wibble: is missing some or all of its configuration.");
        }

        var isAdmin = imports.admin.isAdmin;
        const adminCooldown = client._plugins.getRole("cooldown");
        if (adminCooldown) {
            var cooldown = wibbleConfig['cooldown'];
            if (!cooldown) {
                client._logger.warn('tennu-wibble: Cooldown plugin found but no cooldown defined.')
            }
            else {
                isAdmin = adminCooldown(cooldown);
                client._logger.notice('tennu-wibble: cooldowns enabled: ' + cooldown + ' seconds.');
            }
        }

        function WibbleWobbleCheck(IRCMessage) {

            return isAdmin(IRCMessage.hostmask).then(function(isadmin) {

                // isadmin will be "undefined" if cooldown system is enabled
                // isadmin will be true/false if cooldown system is disabled
                if (typeof(isadmin) !== "undefined" && isadmin === false) {
                    throw new Error(requiresAdminHelp);
                }

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

            }).catch(adminFail);
        }

        function adminFail(err) {
            return {
                intent: 'notice',
                query: true,
                message: err
            };
        }

        return {
            handlers: {
                "privmsg": WibbleWobbleCheck,
            }
        };

    }
};

module.exports = WibblePlugin;