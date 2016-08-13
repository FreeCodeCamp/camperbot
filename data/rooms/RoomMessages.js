'use strict';

// the users input is scanned for these keywords
// and can trigger the messages below
// chance controls the frequency the result will be echoed back by the camper

// using js rather than json so we can have functions and comments

const BotCommands = require('../../lib/bot/BotCommands'),
      _ = require('lodash'),
      Utils = require('../../lib/utils/Utils');


// TODO - add these to all of the rooms
// this is easier for people to add content to
// as they don't have to add to two lists
const AllRoomMessages = [
  {
    regex: /.*help.*bonfire:?s?/i,
    text: ' > type `bonfire name` to get some info on that bonfire. ' +
          'And check [HelpBonfires chatroom]' +
          '(https://gitter.im/FreeCodeCamp/HelpJavaScript)',
    not: 'freecodecamp/HelpJavaScript'
  },
  {
    regex: /\btroll\b/i,
    text: '> :trollface: troll problems? [notify admins here]' +
          '(https://gitter.im/FreeCodeCamp/admin)'
  },
  {
    regex: /allyourbase/,
    text: '![all your base]' +
          '(https://files.gitter.im/FreeCodeCamp/CoreTeam/Bw51/imgres.jpg)'
  },
  {
    regex: /'''/,
    text: '> :bulb: to format code use backticks! ``` [more info]' +
          '(https://github.com/freecodecamp/freecodecamp/wiki/code-formatting)'
  },
  {
    regex: /holler/i,
    text: '> holler back!',
    // only say this 50% of the time
    chance: 1
  },
  {
    // tests: https://regex101.com/r/hH5cN7/42
    regex: /((?:^|\s)(?:(?:th(?:n[qx]|x)|t[xyq])|than[kx](?:[sxz]){0,2}(?:[uq]|y(?:ou)?)?)|gracias?|spasibo|dhanyavaad(?:hamulu)?|o?brigad(?:o|a)|dziekuje|(?:re)?merci|multumesc|shukra?an|danke)\b/gi,
    func: BotCommands.thanks
  },
  {
    // tests: https://regex101.com/r/pT0zJ1/3
    regex: /(?:^|\s)(?:love|luv)\s?(?:u|you|me)?,?\s?(?:cbot|@?camperbot)\b/i,
    func: function(input) {
        const fromUser = '@' + input.message.model.fromUser.username;
        return fromUser + ', :sparkles: :heart_eyes: :sparkles:';
    }
  }
];

const RoomMessages = {
  scanInput: function(input, roomName, chance) {
    if (Math.random() > chance) {
       // dont always reply
      return null;
    }
    const chat = input.message.model.text.toLowerCase();
    chance = chance || 1;
    roomName = roomName.toLowerCase();

    // some messages are only for certain rooms so exclude them here
    const thisRoomMessages = AllRoomMessages.filter(msg => {
      if (msg.not) {
        return (msg.not !== roomName);
      } else {
        return true;
      }
    });
    if (!thisRoomMessages) { return false; }

    const msgList = thisRoomMessages.filter(item => {
      if (!item) { return null; }

      if (item.regex) {
        var flag = item.regex.test(chat);
      }

      if (flag) {
        Utils.clog(chat, item.word, 'flag:' + flag);
      }
      return flag;
    });

    // now check if chance is high enough
    if (msgList.length > 0) {
      // if we have multiple messages, make sure to choose just one
      const oneMessage = _.sample(msgList);
      // check if the chance is high enough so we can have % of time messages
      chance = oneMessage.chance || 1;
      if (Math.random() < (chance)) {
        // we have a winner!
        return oneMessage;
      }
    }
    return null;
  }
};

module.exports = RoomMessages;
