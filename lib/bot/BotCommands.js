'use strict';

const KBase = require('../bot/KBase'),
      Utils = require('../../lib/utils/Utils'),
      AppConfig = require('../../config/AppConfig'),
      InputWrap = require('../bot/InputWrap'),
      _ = require('lodash');

const newline = '\n';

const BotCommands = {
  isCommand: function(input) {
    let res;

    const cmds = BotCommands.cmdList.filter(c => {
      return (c === input.keyword);
    });

    const one = cmds[0];
    if (one) {
      res = true;
    } else {
      res = false;
      Utils.warn('isCommand', 'not command', input);
      Utils.warn('isCommand',
        '[ isCommand: ' + input.keyword + ' one: ' + one + ' res: ' + res );
    }
    return res;
  },

  cbot: function(input, bot) {
    switch (input.params) {
      case 'version':
        return this.botversion(input, bot);
      case 'status':
        Utils.log('input', input);
        const status = this.botstatus(input, bot);
        Utils.clog('status', status);
        return status;
      default:
        return 'you called?';
    }
  },

  // very simple example function showing how to parse a message and respond
  // 'echo' is already a botCommand
  echo: function(input) {
    const username = input.message.model.fromUser.username;
    return '@' + username + ' said: ' + input.message.model.text;
  },

  botversion: function() {
    return 'botVersion: ' + AppConfig.botVersion;
  },

  botstatus: function() {
    return 'All bot systems are go!  \n' + this.botversion() + newline +
      this.botenv() + newline + 'botname: ' + AppConfig.getBotName() + newline;
  },

  botenv: function() {
    return 'env: ' + AppConfig.serverEnv;
  },

  archive: function(input) {
    const roomName = input.message.room.name,
          shortName = InputWrap.roomShortName(input),
          roomUri = AppConfig.gitterHost + roomName + '/archives/',
          timeStamp = Utils.timeStamp('yesterday');

    return 'Archives for **' + shortName + '**' + newline +
      '\n- [All Time](' + roomUri + 'all)' +
      '\n- [Yesterday](' + roomUri + timeStamp + ')';
  },

  init: function(bot) {
    // TODO - FIXME this is sketchy storing references like a global
    // called from the bot where we don't always have an instance
    BotCommands.bot = bot;
  },

  tooNoisy: function() {
    // if this.room.name
    return false;
  },

  // help on its own we return `help bothelp`
  help: function(input, bot) {
    if (this.tooNoisy(input, bot)) {
      return null;
    }

    if (input.params) {
      return this.wiki(input, bot);
    } else {
      const keyword = 'camperbot',
            topicData = KBase.getTopicData(keyword);
      return topicData.shortData + this.wikiFooter(keyword);
    }
  },

  menu: function() {
    return 'type help for a list of things the bot can do';
  },

  // TODO - sort alphabetically
  rooms: function() {
    return '## rooms\nSee all the FreeCodeCamp rooms at ' +
      '[gitter.im/FreeCodeCamp/rooms](https://gitter.im/orgs/FreeCodeCamp/' +
      'rooms)\nOr check [this wiki article](https://github.com/freecodecamp/' +
      'freecodecamp/wiki/official-free-code-camp-chat-rooms) for a shortlist';
  },

  find: function(input, bot) {
    const shortList = KBase.getTopicsAsList(input.params);

    bot.context = {
        state: 'finding',
        commands: shortList.commands
    };

    const str = 'find **' + input.params + '**\n' + shortList;
    bot.makeListOptions(str);
    return str;
  },

  commands: function() {
    return '## commands:\n- ' + BotCommands.cmdList.join('\n- ');
  },

  // TODO - FIXME this isn't working it seems
  // rejoin: function (input, bot) {
  //     clog('GBot', GBot);
  //     BotCommands.bot.scanRooms();
  //     return 'rejoined';
  // },

  music: function() {
    return '## Music!\n http://musare.com/';
  },

  announce: function(input) {
    const parts = input.params.split(' '),
          roomName = parts[0],
          text = parts.join(' ');
    this.bot.sayToRoom(text, roomName);
  },

  rollem: function(input) {
    const fromUser = '@' + input.message.model.fromUser.username;
    return fromUser + ' says enjoy!' +
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  },

  eightball: function(input) {
    const fromUser = '@' + input.message.model.fromUser.username;
    const replies = [
      'it is certain', 'it is decidedly so', 'without a doubt',
      'yes. Definitely', 'you may rely on it', 'as I see it, yes',
      'most likely', 'outlook good', 'yes', 'signs point to yes',
      'reply hazy try again', 'ask again later', 'better not tell you now',
      'cannot predict now', 'concentrate and ask again', 'don\'t count on it',
      'my reply is no', 'my sources say no', 'outlook not so good',
      'very doubtful'
    ];

    var reply = replies[Math.floor(Math.random() * replies.length)];
    return fromUser + ' :8ball: ' + reply + ' :sparkles:';
  },

  camperCount: function() {
    return 'WIP camperCount';
  },

  love: function(input) {
    const fromUser = '@' + input.message.model.fromUser.username;
    return fromUser + ', :sparkles: :heart_eyes: :sparkles:';
  },

  welcome: function(input) {
    if (input.params && input.params.match(/world/i)) {
      return '## welcome to FreeCodeCamp @' +
        input.message.model.fromUser.username + '!';
    }
  },

  hello: function(input, bot) {
    return (this.welcome(input, bot) );
  }
};


// TODO - iterate and read all files in /cmds
const wiki = require('./cmds/wiki'),
      thanks = require('./cmds/thanks'),
      update = require('./cmds/update'),
      bonfire = require('./cmds/bonfire');

_.merge(BotCommands, wiki, thanks, update, bonfire);

// aliases
BotCommands.explain = BotCommands.wiki;
BotCommands.bot = BotCommands.wiki;
BotCommands.hi = BotCommands.welcome;
BotCommands.index = BotCommands.topics;
BotCommands.thank = BotCommands.thanks;
BotCommands.log = BotCommands.archive;
BotCommands.archives = BotCommands.archive;

// TODO - some of these should be filtered/as private
BotCommands.cmdList = Object.keys(BotCommands);

module.exports = BotCommands;
