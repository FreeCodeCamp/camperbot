'use strict';

const Utils = require('../../../lib/utils/Utils');
const HttpWrap = require('../../../lib/utils/HttpWrap');
const TextLib = require('../../../lib/utils/TextLib');
const dedent = require('dedent');
const _ = require('lodash');

const thanksCommands = {
  thanks: function (input, bot) {
    Utils.hasProperty(input, 'message', 'thanks expects an object');

    const mentions = input.message.model.mentions;

    if (_.isEmpty(mentions)) {
      Utils.warn('thanks', 'without any mentions', input.message.model);
      return null;
    }

    const fromUser = input.message.model.fromUser.username;

    /*
     * - filter the mentions by unique mentions
     * - filter by removing the thanking user
     * - grab the `screenName`
     */
    const thankList = _.chain(mentions)
      .uniq('screenName')
      .filter(user =>
        user.screenName.toLowerCase() !== fromUser.toLowerCase()
        && !!user.userId
      )
      .map('screenName')
      .value();

    let message = '';

    const THANKLIST_SIZE = thankList.length;
    if (THANKLIST_SIZE > 0) {
      const $symboledThankedList = _.chain(thankList).map(user => `@${user}`);

      // get the last user
      const $lastUser = $symboledThankedList.last();
      const $initialUsers = $symboledThankedList.take(THANKLIST_SIZE - 1);

      let thankedUsersMsg = $initialUsers.value().join(', ');
      // if more than one user is thanked
      // then append an "and"
      if (thankedUsersMsg !== '') {
        thankedUsersMsg += ' and ';
      }

      thankedUsersMsg += $lastUser.value();
      message += dedent`\n
         > @${fromUser} sends brownie points to ${thankedUsersMsg} \
         :sparkles: :smiley: :thumbsup: :sparkles:
       `;
    }

    if (mentions.find(
        user => user.screenName.toLowerCase() === fromUser.toLowerCase()
      )) {
      message += dedent`\n
         > sorry @${fromUser}, you can't send brownie points to yourself! \
         :no_good: :no_good:
       `;
    }

    const options = {
      method: 'POST',
      input,
      bot
    };

    thankList.forEach(toUser => {
      const apiPath = '/api/users/give-brownie-points'
        + `?receiver=${toUser.toLowerCase()}`
        + `&giver=${fromUser.toLowerCase()}`;
      HttpWrap.callApi(apiPath, options, thanksCommands.showInfoCallback);
    });

    return message;
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
    return null;
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
            brownieEmoji = about.browniePoints < 999 ? ':cookie:' : ':star2:',
            uri = 'http://www.freecodecamp.com/' + username;
      str = `> ${brownieEmoji} ${about.browniePoints} | @${username} |`;
      str += TextLib.mdLink(uri, uri);
    } catch (err) {
      Utils.error('can\'t create response from API callback', err);
      Utils.warn('thanks>', 'blob>', blob);
      str = 'api offline';
    }
    return blob.bot.say(str, blob.input.message.room);
  }
};

module.exports = thanksCommands;
