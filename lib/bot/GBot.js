'use strict';

const AppConfig = require('../../config/AppConfig'),
      RoomData = require('../../data/RoomData'),
      Utils = require('../../lib/utils/Utils'),
      KBase = require('../../lib/bot/KBase'),
      BotCommands = require('../../lib/bot/BotCommands'),
      Bonfires = require('../app/Bonfires'),
      Gitter = require('node-gitter'),
      GitterHelper = require('../../lib/gitter/GitterHelper'),
      RoomMessages = require('../../data/rooms/RoomMessages');

function clog(msg, obj) {
    Utils.clog('GBot>', msg, obj);
}

let apiWait = 0;
let apiDelay = 1000;

const GBot = {

  init: function() {
    // TODO refresh and add oneToOne rooms
    KBase.initSync();
    this.roomList = [];
    this.listReplyOptions = [];
    this.gitter = new Gitter(AppConfig.token);
    this.joinKnownRooms();

    // listen to other rooms for 1:1
    if (AppConfig.supportDmRooms) {
      this.gitter.currentUser().then(user => {
        this.scanRooms(user, AppConfig.token);
      }, err => {
        Utils.error('GBot.currentUser>', 'failed', err);
      });
    }
    BotCommands.init(this);
  },

  getName: function() {
    return AppConfig.botlist[0];
  },

  // listen to a known room
  // does a check to see if not already joined according to internal data
  listenToRoom: function(room) {
    if (this.addToRoomList(room) === false) {
      return;
    }

    const chats = room.streaming().chatMessages();

    // The 'chatMessages' event is emitted on each new message
    chats.on('chatMessages', message => {
      if (message.operation !== 'create') {
        return;
      }
      if (GBot.isBot(message.model.fromUser.username)) {
        return;
      }

      message.room = room;
      GBot.handleReply(message);
    });
  },

  handleReply: function(message) {
    clog(message.room.uri + ' @' + message.model.fromUser.username + ':');
    clog(' in|', message.model.text);
    const output = this.findAnyReply(message);
    if (output) {
      clog('out| ', output);
      GBot.say(output, message.room);
    }
    // for debugging
    return output;
  },

  // using a callback to get roomId
  sayToRoom: function(text, roomName) {
    const sayIt = () => {
      console.log('sayIt', text, roomName);
      GBot.say(text, roomName);
    };
    GitterHelper.findRoomByName(roomName, sayIt);
  },

  say: function(text, room) {
    // did we get a room
    Utils.hasProperty(room, 'path', 'expected room object');
    if (!text) {
      console.warn('tried to say with no text');
    }
    try {
      GitterHelper.sayToRoomName(text, room.uri);
    } catch (err) {
      Utils.warn('GBot.say>', 'failed', err);
      Utils.warn('GBot.say>', 'room', room);
    }
  },

  // search all reply methods
  // returns a string to send
  // handleReply takes care of sending to chat system
  findAnyReply: function(message) {
    const input = this.parseInput(message),
          listReplyOptionsAvailable = this.findListOption(input);
    let output;

    if (input.command && BotCommands.hasOwnProperty(input.keyword) && typeof BotCommands[input.keyword] === 'function') {
      // this looks up a command and calls it
      output = BotCommands[input.keyword](input, this);
    } else if (listReplyOptionsAvailable !== false) {
      // if a list exists and user chose an option
      output = listReplyOptionsAvailable;
    } else {
      // non-command keywords like 'troll'
      const scanCommand = RoomMessages.scanInput(input, input.message.room.name,
                                                 AppConfig.botNoiseLevel);
      if (scanCommand) {
        if (scanCommand.text) {
          output = (scanCommand.text);
        }
        if (scanCommand.func) {
          output = scanCommand.func(input, this);
        }
      }
    }
    // TODO - check its a string or nothing
    return output;
  },

  // save a list of options
  // when the bot sends out a list
  makeListOptions: function(output) {
    let matches = [];
    // find what is between [] brackets in the list of links
    // example [bonfire arguments optional]
    output.replace(/\[([a-zA-Z ]+)\]/g, (g0, g1) => {
      matches.push(g1);
    });
    // stores 'bonfire arguments optional' and the like in an array
    this.listReplyOptions = matches;
    return matches;
  },

  // reply option to user
  // if they chose an option from the list
  findListOption: function(input) {
    const parsedInput = parseInt(input.cleanText, 10);

    if (!this.listReplyOptions || this.listReplyOptions.length === 0) {
      return false;
    } else if (input.cleanText.match(/^[0-9]+$/i) === null) {
      // check if input is not a number
      return false;
    } else if (typeof this.listReplyOptions[parsedInput] === 'undefined') {
      return false;
    }

    // get chosen wiki or bonfire article to output
    input.params = this.listReplyOptions[parsedInput];
    let output;
    if (input.params.split(' ')[0] === 'bonfire') {
      output = BotCommands['bonfire'](input, this);
    } else {
      output = BotCommands['wiki'](input, this);
    }

    this.listReplyOptions = [];
    return output;
  },

  // turns raw text input into a json format
  parseInput: function(message) {
    Utils.hasProperty(message, 'model');

    let cleanText = message.model.text;
    cleanText = Utils.sanitize(cleanText);

    let input = Utils.splitParams(cleanText);
    input = this.cleanInput(input);
    input.message = message;
    input.cleanText = cleanText;

    if (BotCommands.isCommand(input)) {
      input.command = true;
    }
    return input;
  },

  cleanInput: function(input) {
    // 'bot' keyword is an object = bad things happen when called as a command
    if (input.keyword === 'bot') {
      input.keyword = 'help';
    }
    return input;
  },

  announce: function(opts) {
    clog('announce', opts);
    this.joinRoom(opts, true);
  },

  joinRoom: function(opts) {
    const roomUrl = opts.roomObj.name;

    GBot.gitter.rooms.join(roomUrl, (err, room) => {
      if (err) {
        console.warn('Not possible to join the room: ', err, roomUrl);
      }
      GBot.roomList.push(room);
      // have to stagger this for gitter rate limit
      GBot.listenToRoom(room);
      const text = GBot.getAnnounceMessage(opts);
      GBot.say(text, room);

      return room;
    });

    return false;
  },

  // checks if joined already, otherwise adds
  addToRoomList: function(room) {
    // check for dupes
    this.roomList = this.roomList || [];
    if (this.hasAlreadyJoined(room, this.roomList)) {
      return false;
    }

    this.roomList.push(room);
    return true;
  },

  // checks if a room is already in bots internal list of joined rooms
  // this is to avoid listening twice
  // see https://github.com/gitterHQ/node-gitter/issues/15
  // note this is only the bots internal tracking
  // it has no concept if the gitter API/state already thinks
  // you're joined/listening
  hasAlreadyJoined: function(room) {
    const checks = this.roomList.filter(rm => {
      return (rm.name === room.name);
    });

    const oneRoom = checks[0];
    if (oneRoom) {
      Utils.warn('GBot', 'hasAlreadyJoined:', oneRoom.url);
      return true;
    }

    return false;
  },

  getAnnounceMessage: function() {
    return '';
  },

  // dont reply to bots or you'll get a feedback loop
  isBot: function(who) {
    // 'of' IS correct even tho ES6Lint doesn't get it
    for (let bot of AppConfig.botlist) {
      if (who === bot) {
        return true;
      }
    }
    return false;
  },

  // this joins rooms contained in the data/RoomData.js file
  // ie a set of bot specific discussion rooms
  joinKnownRooms: function() {
    clog('botname on rooms', AppConfig.getBotName());

    RoomData.rooms().map(oneRoomData => {
      const roomUrl = oneRoomData.name;
      this.delayedJoin(roomUrl);
    });
  },


  delayedJoin: function(roomUrl) {
    apiWait += apiDelay;
    setTimeout(() => {
      this.gitter.rooms.join(roomUrl, (err, room) => {
        if (err) {
          Utils.warn('Not possible to join the room:', roomUrl, err);
          return;
        }
        clog('joined> ', room.name);
        this.listenToRoom(room);
      });
    }, apiWait);
  },

  joinBonfireRooms: function() {
    Bonfires.allDashedNames().map(name => {
      const roomUrl = AppConfig.getBotName() + '/' + name;
      this.delayedJoin(roomUrl);
    });
  },

  // uses gitter helper to fetch the list of rooms this user is 'in'
  // and then tries to listen to them
  // this is mainly to pick up new oneOnOne conversations
  // when a user DMs the bot
  // as I can't see an event the bot would get to know about that
  // so its kind of like 'polling' and currently only called from the webUI
  scanRooms: function(user, token) {
    clog('user', user);
    clog('token', token);
    GitterHelper.fetchRooms(user, token, (err, rooms) => {
      if (err) {
        Utils.warn('GBot', 'fetchRooms', err);
      }
      if (!rooms) {
        Utils.warn('cant scanRooms');
        return;
      }
      clog('scanRooms.rooms', rooms);
      rooms.map(room => {
        if (room.oneToOne) {
          clog('oneToOne', room.name);
          this.gitter.rooms.find(room.id)
            .then(roomObj => {
              this.listenToRoom(roomObj);
            });
        }
      });
    });
  },

  // TODO - FIXME doesnt work for some reason >.<
  // needs different type of token?
  updateRooms: function() {
    GBot.gitter.currentUser()
      .then(user => {
        const list = user.rooms((err, obj) => {
          clog('rooms', err, obj);
        });
        clog('user', user);
        clog('list', list);
        return list;
      });
  }
};

module.exports = GBot;
