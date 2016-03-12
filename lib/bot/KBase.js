'use strict';

const TextLib = require('../utils/TextLib'),
      fs = require('fs'),
      path = require('path'),
      Utils = require('../utils/Utils');

// topicNameList - list of individual topic keywords eg 'chai-cheat'
// topics    - Hash full data of all topics

//  example topic:
//
// 'js-for':
//  { path: '/Users/dc/dev/fcc/gitterbot/nap/data/wiki/js-for.md',
//    topic: 'js-for',
//    fname: 'js-for.md',
//    data: 'The javascript `for` command iterates through a list of items.\n\n
//           ```js\nfor (var i = 0; i < 9; i++) {\n   console.log(i);\n
//               // more statements\n}\n```\n\n----',
//    shortData: 'The javascript `for` command iterates through a list of items.
//                \n\n```js\nfor (var i = 0; i < 9; i++) {\n   console.log(i);\n
//                   // more statements\n}\n```\n\n----' },

const KBase = {
  files: [],
  topics: null,
  findMoreResults: [],

  initSync: function() {
    // TODO - FIXME works relative?
    const wikiDataDir = path.join(__dirname, '/../../data/fcc.wiki');

    KBase.allData = [];
    fs.readdirSync(wikiDataDir).forEach(name => {
      if ((/md$/).test(name)) {
        const filePath = path.join(wikiDataDir, name),
              arr = filePath.split(path.sep),
              fileName = arr[arr.length - 1].toLowerCase(),
              topicName = fileName.replace('.md', ''),
              data = fs.readFileSync(filePath, 'utf8');

        const blob = {
            path: filePath,
            displayName: Utils.namify(topicName),
            fileName: fileName,
            data: data,
            shortData: TextLib.trimLines(data),
            hardlinks: TextLib.fixRelativeLink(data),
            dashedName: TextLib.dashedName(topicName)
        };

        KBase.allData.push(blob);
      }
    });
    return KBase.allData;
  },

  getWikiHints: function(bfName) {
    const topicData = this.getTopicData(bfName);
    if (topicData) {
      return topicData.data.split('##');
    } else {
      return null;
    }
  },

  getTopicData: function(params) {
    const searchDashName = TextLib.dashedName(params);

    if (!KBase.allData) {
      KBase.initSync();
    } else {
      const shortList = KBase.allData.filter(t => {
        return (t.dashedName.includes(searchDashName));
      });
      if (shortList) {
        return shortList[0];
      } else {
        Utils.warn('KBase', 'cant find topicData for', params);
        Utils.warn('Kbase', 'allData', KBase.allData);
        return null;
      }
    }
  },

  getTopics: function(keyword) {
    // TODO - refac and use function above
    const searchDashName = TextLib.dashedName(keyword);
    const shortList = this.allData.filter(t => {
      return (t.dashedName.includes(searchDashName));
    });
    return shortList;
  },

  //    return topics as markdown links
  getTopicsAsList: function(keyword) {
    const shortList = this.getTopics(keyword);
    let findResults;
    if (shortList.length === 0) {
      return 'nothing found';
    }
    if (this.findMoreResults[0] === keyword) {
      // continue list of enteries after limit
      findResults = this.findMoreResults[1];
      this.findMoreResults = [];
      return '> more enteries: \n ' + findResults;
    }
    this.findMoreResults = [];
    // else
    Utils.log('shortList', shortList);

    const emojiList = [':zero:', ':one:', ':two:', ':three:', ':four:',
                        ':five:', ':six:', ':seven:', ':eight:', ':nine:'];
    const listLimit = 20;

    findResults = '';
    for (let i = 0; i < shortList.length; i++) {
      let topicData = shortList[i],
          link = Utils.linkify(topicData.dashedName, 'wiki',
                                 topicData.displayName);
      let line;
      if (i < 10) {
        line = '\n ' + emojiList[i] + ' ' + link;
      } else if (i < 100) {
        let iSplit = i.toString().split('');
        line = '\n ' + emojiList[iSplit[0]] +
               emojiList[iSplit[1]] + ' ' + link;
      }

      if (i === listLimit) {
        // meets limit
        findResults += '\n > limited to first ' + listLimit + ' entries.' +
                       '\n > type `find ' + keyword +
                       '` again for more enteries.';
        this.findMoreResults[0] = keyword;
        this.findMoreResults[1] = '' + line;
      } else if (i > listLimit) {
        // exceeds limit
        this.findMoreResults[1] += line;
      } else {
        // below limit
        findResults += line;
      }
    }
    return findResults;
  }
};

KBase.initSync();

module.exports = KBase;
