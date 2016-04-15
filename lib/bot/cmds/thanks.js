'use strict';

const Utils = require('../../../lib/utils/Utils'),
      HttpWrap = require('../../../lib/utils/HttpWrap'),
      TextLib = require('../../../lib/utils/TextLib');

const thanksCommands = {

  messages: {
    wikiHint: function(fromUser) {
      const wikiUrl = '(https://github.com/freecodecamp/' +
                    'freecodecamp/wiki/wiki-style-guide)';

      return '\n> hey @' + fromUser + ' if you found this info helpful ' +
        ':point_right: *[consider adding a wiki article!]' + wikiUrl + '*';
    }
  },

  thanks: function(input, bot) {
    Utils.hasProperty(input, 'message', 'thanks expects an object');

    const mentions = input.message.model.mentions;
    // just 'thanks' in a message
    if (mentions && mentions.length === 0) {
      Utils.warn('thanks', 'without any mentions', input.message.model);
      return null;
    }

    const fromUser = input.message.model.fromUser.username.toLowerCase();
    const options = {
      method: 'POST',
      input: input,
      bot: bot
    };

    const namesList = mentions.reduce((userList, mention) => {
      const toUser = mention.screenName.toLowerCase();

      if (toUser !== fromUser && toUser !== 'all'  && userList.indexOf(toUser) === -1) {
        const apiPath = '/api/users/give-brownie-points?receiver=' + toUser +
                        '&giver=' + fromUser;
        HttpWrap.callApi(apiPath, options, thanksCommands.showInfoCallback);
        userList.push(toUser);
      }
      return userList;
    }, []);

    if (namesList.length > 0) {
      const toUserMessage = namesList.join(' and @');
      return '> ' + fromUser + ' sends brownie points to @' + toUserMessage +
        ' :sparkles: :thumbsup: :sparkles: ';
    } else {
      return '> sorry ' + fromUser + ', you can\'t send brownie points to ' +
        'yourself! :sparkles: :sparkles: ';
    }
  },

  about: function(input, bot) {
    const mentions = input.message.model.mentions,
          them = mentions[0];

    if (!them) {
      Utils.warn('about without any mentions', input.message.model);
      return 'you need to ask about @someone!';
    }
    const name = them.screenName.toLowerCase();
    const options = {
      method: 'GET',
      input: input,
      bot: bot
    };

    const apiPath = '/api/users/about?username=' + name;
    HttpWrap.callApi(apiPath, options, thanksCommands.showInfoCallback);
  },

  // called back from apiCall so can't use Global GBot here
  // blob:
  //      response
  //      bot
  //      input
  showInfoCallback: function(blob) {
    // in case we want to filter the message
    const cleanMessage = message => {
      // return message;
      if (message.match(/^FCC: no user/)) {
        message = 'hmm, can\'t find that user on the beta site. wait til ' +
                  'we release new version!';
      }
      message = '> :warning: ' + message;
      return message;
    };

    if (blob.response.error) {
      const message = cleanMessage(blob.response.error.message);

      Utils.warn('WARN @thanks>', blob.response.error.message,
                 blob.response.error);

      // show the error to the user
      blob.bot.say(message, blob.input.message.room);
      return false;
    }

    let str;
    try {
      const username = blob.response.about.username,
            about = blob.response.about,
            uri = 'http://www.freecodecamp.com/' + username;
      str = '> :cookie: ' + about.browniePoints + ' | @' + username + ' | ';
      str += TextLib.mdLink(uri, uri);
    } catch (err) {
      Utils.error('can\'t create response from API callback', err);
      Utils.warn('thanks>', 'blob>', blob);
      str = 'api offline';
    }
    blob.bot.say(str, blob.input.message.room);
  }
};

module.exports = thanksCommands;
