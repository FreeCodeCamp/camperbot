'use strict';

const AppConfig = require('../../config/AppConfig');

const TextLib = {
  // we only show the first para
  // and limit to 20 lines
  
  // Converts relative links from the wiki to hardlinks for gitter
  fixRelativeLink: function fixRelativeLink(wikiContent, baseUrl ) {
	if(typeof baseUrl === "undefined"){
		baseUrl = 'http://github.com/FreeCodeCamp/FreeCodeCamp/wiki/';
	}
    const linkMatchRegExp = /.+\]\((.+)\)/g;
	return wikiContent.split('\n').map((line) => {
		if(line.match(linkMatchRegExp) && line.match(linkMatchRegExp).length > 0){
			line = line.split(' ').map((word) => {
				if(word.match(linkMatchRegExp)) {
					if(!word.match(/\:\/\//gi)) {
						word = word.replace(/\((.+)\)/gi, "(" + baseUrl + '$1' + ")");
						return word;
					}
				}
				return word;
			}).join(' ');
		}
		return (line)
	}).join('\n');	
  },
  
  trimLines: function(data, lines) {
    const part = data.split('\n## ')[0];
    lines = lines || AppConfig.MAX_WIKI_LINES;
    let subset = part.split('\n');
    subset = subset.slice(0, lines).join('\n');
    return subset;
  },

  mdLink: function(text, uri) {
    return '[' + text + '](' + uri + ')';
  },

  dashedName: function(str) {
    if (!str) { return; }
    str = str.replace(/\s/g, '-');
    str = str.toLowerCase();
    // in case of doubles
    str = str.replace('--', '-');
    str = str.replace('.md', '');
    str = str.replace(/([^a-z0-9áéíóúñü_@\-\s]|[\t\n\f\r\v\0])/gim, '');
    /* eslint-disable consistent-return */
    return str;
    /* eslint-enable consistent-return */
  }
};

module.exports = TextLib;
