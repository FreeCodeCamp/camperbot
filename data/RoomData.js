'use strict';

// This file needs to be edited to comment out
// rooms you want to join

// TODO - move to lib/ dir?

const AppConfig = require('../config/AppConfig');

// from the webapp
// users enter the rooms with a topic=XXX url
// we find a matching room here with that topic
// and redirect them

// TODO - read this from the JSON file
const bonfireTopics = [
  'bonfires',
  'Pair Program on Bonfires',
  'Meet Bonfire',
  'Reverse a String',
  'Factorialize a Number',
  'Check for Palindromes',
  'Find the Longest Word in a String',
  'Title Case a Sentence',
  'Return Largest Numbers in Arrays',
  'Confirm the Ending',
  'Repeat a string repeat a string',
  'Truncate a string',
  'Chunky Monkey',
  'Slasher Flick',
  'Mutations',
  'Falsey Bouncer',
  'Where art thou',
  'Seek and Destroy',
  'Where do I belong',
  'Sum All Numbers in a Range',
  'Diff Two Arrays',
  'Roman Numeral Converter',
  'Search and Replace',
  'Pig Latin',
  'DNA Pairing',
  'Missing letters',
  'Boo who',
  'Sorted Union',
  'Convert HTML Entities',
  'Spinal Tap Case',
  'Sum All Odd Fibonacci Numbers',
  'Sum All Primes',
  'Smallest Common Multiple',
  'Finders Keepers',
  'Drop it',
  'Steamroller',
  'Binary Agents',
  'Everything Be True',
  'Arguments Optional'
];

const bonfireDashedNames = [
  'bonfire-meet-bonfire',
  'bonfire-reverse-a-string',
  'bonfire-factorialize-a-number',
  'bonfire-check-for-palindromes',
  'bonfire-find-the-longest-word-in-a-string',
  'bonfire-title-case-a-sentence',
  'bonfire-return-largest-numbers-in-arrays',
  'bonfire-confirm-the-ending',
  'bonfire-repeat-a-string-repeat-a-string',
  'bonfire-truncate-a-string',
  'bonfire-chunky-monkey',
  'bonfire-slasher-flick',
  'bonfire-mutations',
  'bonfire-falsey-bouncer',
  'bonfire-where-art-thou',
  'bonfire-seek-and-destroy',
  'bonfire-where-do-i-belong',
  'bonfire-sum-all-numbers-in-a-range',
  'bonfire-diff-two-arrays',
  'bonfire-roman-numeral-converter',
  'bonfire-search-and-replace',
  'bonfire-pig-latin',
  'bonfire-dna-pairing',
  'bonfire-missing-letters',
  'bonfire-boo-who',
  'bonfire-sorted-union',
  'bonfire-convert-html-entities',
  'bonfire-spinal-tap-case',
  'bonfire-sum-all-odd-fibonacci-numbers',
  'bonfire-sum-all-primes',
  'bonfire-smallest-common-multiple',
  'bonfire-finders-keepers',
  'bonfire-drop-it',
  'bonfire-steamroller',
  'bonfire-binary-agents',
  'bonfire-everything-be-true',
  'bonfire-arguments-optional',
  'bonfire-make-a-person',
  'bonfire-map-the-debris',
  'bonfire-pairwise',
  'bonfire-validate-us-telephone-numbers',
  'bonfire-symmetric-difference',
  'bonfire-exact-change',
  'bonfire-inventory-update',
  'bonfire-no-repeats-please',
  'bonfire-friendly-date-ranges'
];

var camperBotChatRooms = [
    'FreeCodeCamp/admin',
    'FreeCodeCamp/camperbot',
    'FreeCodeCamp/camperbotPlayground',
    'FreeCodeCamp/Casual',
    'FreeCodeCamp/CodeReview',
    'FreeCodeCamp/CodingJobs',
    'FreeCodeCamp/CurriculumDevelopment',
    'FreeCodeCamp/DataScience',
    'FreeCodeCamp/dotnet',
    'FreeCodeCamp/elixir',
    'FreeCodeCamp/FreeCodeCamp',
    'FreeCodeCamp/Git',
    'FreeCodeCamp/go',
    'FreeCodeCamp/HalfWayClub',
    'FreeCodeCamp/Help',
    'FreeCodeCamp/HelpBackEnd',
    'FreeCodeCamp/HelpContributors',
    'FreeCodeCamp/HelpDataViz',
    'FreeCodeCamp/HelpFrontEnd',
    'FreeCodeCamp/HelpJavaScript',
    'FreeCodeCamp/java',
    'FreeCodeCamp/linux',
    'FreeCodeCamp/LiveCoding',
    'FreeCodeCamp/PairProgrammingWomen',
    'FreeCodeCamp/php',
    'FreeCodeCamp/python',
    'FreeCodeCamp/ruby',
    'FreeCodeCamp/sql',
    'FreeCodeCamp/Wiki',
    'FreeCodeCamp/YouCanDoThis',
    'FreeCodeCamp/YouTube'
];

// @TODO Refactor into a room generator function
const camperBotRooms = [camperBotChatRooms]
  .reduce((rooms, currRooms) => rooms.concat(currRooms))
  .map(room => { return {name: room}; });

const BotRoomData = {
  // this controls which rooms you can access
  YOUR_GITHUB_ID: [
    // change this to be a room your user is already in
    {
      title: 'bothelp',
      name: 'YOUR_GITHUB_ID/testing',
      icon: 'question',
      topics: ['chitchat', 'bots', 'bot-development', 'camperbot']
    },
    {
      title: 'bothelp',
      name: 'bothelp/testing',
      icon: 'question',
      topics: ['chitchat', 'bots', 'bot-development', 'camperbot']
    }
  ],
  // this is the demobot that ships with the app
  demobot: [{
    title: 'demobot',
    name: 'demobot/test',
    icon: 'star',
    topics: ['getting started']
  }],
  // developer bot
  bothelp: [
    {
      title: 'bothelp',
      name: 'bothelp/testing',
      icon: 'question',
      topics: ['chitchat', 'bots', 'bot-development', 'camperbot']
    },
    {
      title: 'HelpBonfires',
      icon: 'fire',
      name: 'bothelp/HelpBonfires',
      topics: bonfireTopics
    },
    {
      title: 'camperbot/localdev',
      name: 'camperbot/localdev'
    },
    {
      title: 'bothelpDM',
      name: 'bothelp'
    },
    {
      title: 'GeneralChat',
      name: 'bothelp/GeneralChat'
    },
    {
      title: 'PrivateRoomTest',
      name: 'bothelp/PrivateRoomTest',
      topics: ['general', 'intros']
    },
    {
      title: 'EdaanDemo',
      name: 'egetzel/demo',
      topics: ['egdemo']
    },
    // Bonfire single rooms
    {
      name: 'bothelp/bonfire-factorialize-a-number',
      topics: ['bonfire factorialize a number'],
      isBonfire: true
    }
  ],
  camperbot: camperBotRooms
};

bonfireDashedNames.map(bfName => {
  const room = {
    name: 'camperbot/' + bfName,
    isBonfire: true
  };
  BotRoomData.camperbot.push(room);
});

BotRoomData.camperbot.map(room => {
  room.title = room.title || room.name.split('/')[1];
  if (room.isBonfire) {
    room.entry = 'camperbot/testing';
    room.topic = room.title;
  }
});

const RoomData = {
  rooms: function(botname) {
    botname = botname || AppConfig.getBotName();
    return BotRoomData[botname];
  },

  defaultRoom: function() {
    return RoomData.rooms().rooms[0];
  }
};

module.exports = RoomData;
