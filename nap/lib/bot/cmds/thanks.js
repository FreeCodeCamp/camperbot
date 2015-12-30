/*jslint todo: true */
"use strict";

var GBot = require("../../../lib/bot/GBot.js");
    //KBase = require("../../bot/KBase"),
var Utils = require("../../../lib/utils/Utils"),
    //AppConfig = require("../../../config/AppConfig"),
    HttpWrap = require("../../../lib/utils/HttpWrap");

var TextLib = require("../../../lib/utils/TextLib");



//var newline = '\n';

//var clog = require('../../utils/clog.js');

// clog("clog from thanks");

// function clog(msg, obj) {
//     Utils.clog("BotCommands>", msg, obj);
// }

// function tlog(msg, obj) {
//     Utils.warn("BotCommands>", msg, obj);
// }



var thanksCommands = {

    messages: {
        wikiHint: function(fromUser) {
            var wikiUrl = "(https://github.com/freecodecamp/freecodecamp/wiki/wiki-style-guide)";
            var msg = "\n> hey @" + fromUser + " if you found this info helpful :point_right: *[consider adding a wiki article!]" + wikiUrl + "*";
            return msg;
        }
    },

    thanks: function(input, bot) {
        Utils.hasProperty(input, "message", "thanks expects an object");
        //Utils.tlog("thanks", input);

        var mentions, output, fromUser, toUser, toUserMessage;
        mentions = input.message.model.mentions;
        if (mentions && mentions.length === 0) {
            Utils.warn("thanks", "without any mentions", input.message.model);
            return null;
        } // just 'thanks' in a message

        fromUser = input.message.model.fromUser.username.toLowerCase();
        var options = {
            method: 'POST',
            input: input,
            bot: bot
        };

        var namesList = mentions.map(function(m) {
            toUser = m.screenName.toLowerCase();
            if (toUser != fromUser) {
                var apiPath = "/api/users/give-brownie-points?receiver=" + toUser + "&giver=" + fromUser;
                HttpWrap.callApi(apiPath, options, thanksCommands.showInfoCallback);
                return toUser;
            } else {
                return null;
            }
        });

        if (namesList[0] != null) {
            toUserMessage = namesList.join(" and @");
            output = "> " + fromUser + " sends brownie points to @" + toUserMessage;
            output += " :sparkles: :thumbsup: :sparkles: ";
            // output += BotCommands.messages.wikiHint(fromUser);
            return output;
        } else {
            output = "> sorry " + fromUser + ", you can't send brownie points to yourself!";
            output += " :sparkles: :sparkles: ";
            return output;
        }
    },
    
    about: function(input, bot) {
        // var mentioned = InputWrap.mentioned(input);
        var mentions, them, name;

        mentions = input.message.model.mentions;
        them = mentions[0];
        if (!them) {
            Utils.warn("about without any mentions", input.message.model);
            return "you need to ask about @someone!";
        }
        name = them.screenName.toLowerCase();
        var options = {
            method: 'GET',
            input: input,
            bot: bot
        };

        var apiPath = '/api/users/about?username=' + name;
        HttpWrap.callApi(apiPath, options, thanksCommands.showInfoCallback);
    },

    // called back from apiCall so can't use Global GBot here
    // blob:
    //      response
    //      bot
    //      input

    showInfoCallback: function(blob) {
        //Utils.clog('thanks>', "showInfoCallback>", blob);

        // in case we want to filter the message
        var cleanMessage = function(message) {
            //return message;
            if (message.match(/^FCC: no user/)) {
                message = "hmm, can't find that user on the beta site. wait til we release new version!"
            }
            message = "> :warning: " + message;
            return message;
        }

        if (blob.response.error) {
            var message = cleanMessage(blob.response.error.message);
            //message += Utils.betaFooter();
            Utils.warn("WARN @thanks>", blob.response.error.message, blob.response.error);

            // show the error to the user
            blob.bot.say(message, blob.input.message.room);
            return false;
        }

        var str;
        try {
            var username = blob.response.about.username;
            var about = blob.response.about;
            var bio = blob.response.about.bio || "no bio set";

            var uri = "http://www.freecodecamp.com/" + username;
            str = "> :poop: " + about.browniePoints + " | @" + username + " | ";
            str += TextLib.mdLink(uri, uri);
        } catch (err) {
            Utils.error("cant create response from API callback", err);
            Utils.warn('thanks>', "blob>", blob);
            str = "api offline";
        }
        blob.bot.say(str, blob.input.message.room);


    }

};

module.exports = thanksCommands;





//        var XXstr = `
//![${username}](https://avatars2.githubusercontent.com/${username}?&s=32) | [${username}](http://www.freecodecamp.com/${username})
//        -------------                       | -------------
//        :star: ${about.browniePoints}       | ${bio}
//
//        `;

