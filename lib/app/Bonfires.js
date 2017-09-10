'use strict';

const fs = require('fs');
const Utils = require('../../lib/utils/Utils');
const InputWrap = require('../../lib/bot/InputWrap');
const KBase = require('../../lib/bot/KBase');
const TextLib = require('../../lib/utils/TextLib');

const newline = '\n';

const Bonfires = {
  data: null,
  fixed: {
    hintWarning: '## :construction: ** After this are possible spoiler hints.' +
      '**\nMake sure you\'ve tried to hard to solve it yourself before ' +
      'proceeding. :construction:',
    menu: '\n- `bonfire info` for more info ' +
      '\n- `bonfire links` ' +
      '\n- `bonfire script` for the script',
    askName: 'give the name of the bonfire and I\'ll try to look it up!',
    setName: 'Set a bonfire to talk about with `bonfire name`',
    comingSoon: 'Coming Soon! We\'re working on it!',
    nameHint: 'no, type part of the name of the bonfire! eg `bonfire roman`',
    alert: '\n - :construction: **spoiler alert** :construction:',

    bfRoomLink: function(name) {
      return '[spoiler chatroom](https://gitter.im/camperbot/' + name + ')';
    },
    footer: function() {
      return '\n\n> more info:&nbsp;&nbsp;`bf details` | ' +
        '`bf links` | `hint` ';
    },
    reminder: function(name) {
      return 'we\'re talking about bonfire :fire: ' + name;
    },
    cantFind: function(name) {
      return '> Sorry, can\'t find a bonfire called ' + name +
        '. [ [Check the map?]' +
        '(http://www.freecodecamp.org/map#Basic-Algorithm-Scripting) ]';
    },
    roomLink: function(name) {
      return ':construction: **spoiler alert** ' + this.bfRoomLink(name) +
        ' :arrow_forward:';
    },
    goToBonfireRoom: function(bf) {
      const link = Utils.linkify(bf.dashedName,
                                 'camperbot', 'Bonfire\'s Custom Room');
      return '> :construction: Spoilers are only in the ' + link +
        ' :point_right: ';
    },
    pleaseContribute: function(bf) {
      const link = Utils.linkify(bf.dashedName,
                                 'wiki', 'Bonfire\'s Wiki Hints Page');
      return 'These hints depend on people like you! ' +
        'Please add to this :point_right: ' + link;
    }
  },

  load: function() {
    // Get document, or throw exception on error
    try {
      const bfDataFiles = [
        'basic-bonfires.json',
        'intermediate-bonfires.json',
        'advanced-bonfires.json',
        'expert-bonfires.json'
      ];

      let allData = {
        challenges: []
      };

      bfDataFiles.map(fname => {
        const raw = fs.readFileSync('./data/seed/challenges/' + fname, 'utf8');
        const thisData = JSON.parse(raw);
        allData.challenges = allData.challenges.concat(thisData.challenges);
      });

      this.data = allData;

      Bonfires.loadWikiHints();

      // TODO - convert the embedded HTML to markdown tags
      // this.data = Utils.toMarkdown(this.data);
    } catch (e) {
      Utils.error('can\'t load bonfire data', e);
    }
    return this;
  },

  loadWikiHints: function() {
    this.data.challenges = this.data.challenges.map(bf => {
      bf.hints = [Bonfires.fixed.hintWarning];
      const wikiHints = KBase.getWikiHints(bf.dashedName);
      if (wikiHints) {
        bf.hints = bf.hints.concat(wikiHints);
      } else {
        Utils.tlog('bf.wikiHints not found', bf.dashedName);
      }
      return bf;
    });
  },

  findBonfire: function(bfName) {
    let flag;
    bfName = TextLib.dashedName(bfName);
    const bfs = this.data.challenges.filter(item => {
      flag = (item.dashedName.indexOf(bfName) >= 0);
      return flag;
    });
    const bf = bfs[0];
    if (!bf) {
      Utils.warn('can\'t find bonfire for ' + bfName);
      return null;
    } else {
      return bf;
    }
  },


  getNextHint: function(bonfire, input) {
    let hint;
    let hintNum = parseInt(input.params, 10);

    if (isNaN(hintNum)) {
      hintNum = bonfire.currentHint || 0;
    }
    hint = bonfire.hints[hintNum];

    if (hintNum < bonfire.hints.length) {
      const hintCounter = hintNum + 1;
      hint = '`hint [' + hintCounter + '/' +
        bonfire.hints.length + ']`\n## ' + hint;
      bonfire.currentHint = hintNum + 1;
      hint += this.wikiLinkFooter(bonfire);
      return hint;
    } else {
      bonfire.currentHint = 0;
      return Bonfires.fixed.pleaseContribute(bonfire);
    }
  },

  toMarkdown: function() {
    this.data.challenges = this.data.challenges.map(item => {
      item.description = item.description.map(desc => Utils.toMarkdown(desc));
    });
  },

  allDashedNames: function() {
    return this.fieldList('dashedName');
  },

  allNames: function() {
    return this.fieldList('name');
  },

  fieldList: function(field) {
    return this.data.challenges.map(item => item[field]);
  },

  fromInput: function(input) {
    const roomName = InputWrap.roomShortName(input);
    const bf = this.findBonfire(roomName);
    Utils.checkNotNull(bf, 'cant find bonfire for ' + roomName);
    return (bf);
  },


  wikiLinkFooter: function(bonfire) {
    let str = '\n\n> type `hint` for next hint  :pencil: ';
    const text = '[Contribute at the FCC Wiki]';

    return str + Utils.linkify(bonfire.dashedName, 'wiki', text);
  },

  getDescription: function(bonfire) {
    return bonfire.description.join('\n');
  },

  getLinks: function(bonfire) {
    return 'links: \n' + Utils.makeMdnLinks(bonfire.MDNlinks, 'mdn');
  },

  getLinksFromInput: function(input) {
    const bf = Bonfires.fromInput(input);

    if (!bf || !bf.MDNlinks) {
      const msg = ('no links found for: ' + input.params);
      Utils.error('Bonfires>', msg, bf);
      return msg;
    }
    return this.getLinks(bf);
  },

  getSeed: function(bonfire) {
    const seed = bonfire.challengeSeed.join('\n');
    return '```js ' + newline + seed + '```';
  },

  getChallengeSeedFromInput: function(input) {
    const bf = Bonfires.fromInput(input);

    if (!bf || !bf.challengeSeed) {
      const msg = ('no challengeSeed found for: ' + input.params);
      Utils.error('Bonfires>', msg, bf);
      return msg;
    }

    const seed = bf.challengeSeed.join('\n');

    return '```js ' + newline + seed + '```';
  },

  // methods that describe a bonfire that accept/expect a bonfire parameter
  bonfireInfo: function(bonfire) {
    if (!bonfire) {
      Utils.error('Bonfires.bonfireInfo', 'no bonfire');
    }

    return this.bonfireHeader(bonfire) + newline +
      this.bonfireScript(bonfire) + newline +
      this.bonfireDescription(bonfire) + newline +
      newline + this.fixed.footer(bonfire.dashedName);
  },

  bonfireStatus: function(bonfire) {
    return '\n- hints: ' + bonfire.hints.length;
  },

  bonfireHeader: function(bonfire) {
    return '## :fire:' + TextLib.mdLink(bonfire.name,
      'www.freecodecamp.org/challenges/' + bonfire.dashedName) + ' :link:';
  },

  bonfireDetails: function(bonfire) {
    return this.bonfireHeader(bonfire) + newline +
      this.bonfireScript(bonfire) + newline +
      this.bonfireDescription(bonfire, 50) + newline +
      this.bonfireLinks(bonfire);
  },

  bonfireDescription: function(bonfire, lines) {
    if (lines) {
      const desc = bonfire.description.slice(0, lines);
      return desc.join('\n');
    } else {
      return bonfire.description[0];
    }
  },

  bonfireLinks: function(bonfire) {
    return Bonfires.getLinks(bonfire);
  },

  bonfireScript: function(bonfire) {
    return Bonfires.getSeed(bonfire);
  },

  bonfireWiki: function() {
    const link = Utils.linkify(this.currentBonfire.name);
    return '> :fire: wiki: ' + link;
  }
};

// ideally KBase should be loaded first,
// though in theory it will load itself before data is needed ...?

Bonfires.load();

module.exports = Bonfires;
