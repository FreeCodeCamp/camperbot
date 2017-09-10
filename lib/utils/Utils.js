'use strict';

require('dotenv').config({ path: 'dot.env' });

const clc = require('cli-color');
const _ = require('lodash');
const AppConfig = require('../../config/AppConfig');
const MDNlinks = require('../../data/seed/bonfireMDNlinks');

const LOG_LEVEL_ERROR = 2;
const LOG_LEVEL_WARN = 3;
const LOG_LEVEL_INFO = 5;

const Utils = {

  cols: {
    error: clc.bgRedBright.white.bold,
    warn: clc.black.bgYellow.bold,
    info: clc.black.cyanBright,
    info2: clc.black.bgCyan,
    notice: clc.blue,
    bright: clc.xterm(237).bgXterm(195),
    dimmed: clc.xterm(232).bgXterm(253),
    warning: clc.xterm(232).bgXterm(215),
    errorColors: clc.xterm(232).bgRedBright
  },

  // default
  logLevel: process.env.LOG_LEVEL || 10,

  log: function(msg, obj) {
    let where = '';
    if (this.logLevel > LOG_LEVEL_INFO) {
      where = this.stackLines(3, 4);
    }
    Utils.clog(where, msg, obj);
  },

  clog: function(where, msg, obj) {
    if (this.logLevel < LOG_LEVEL_INFO) {
      return;
    }
    obj = obj || '';
    console.log(this.cols.info(where), this.cols.info(msg), obj);
  },

  // log during test
  tlog: function() {
    if (process.env.SERVER_ENV) { return; }
    const args = Array.prototype.slice.call(arguments);
    const p1 = args.shift() || '_';
    const p2 = args.shift() || '_';
    const p3 = args.shift() || '_';
    console.log(this.cols.bright(p1), p2, p3);
    args.forEach(p => {
      if (p) { console.log(p); }
    });
  },

  warn: function(where, msg, obj) {
    if (this.logLevel < LOG_LEVEL_WARN) {
      return;
    }
    obj = obj || '';
    console.warn(this.cols.warn(where), this.cols.warn(msg), obj);
  },

  stackTrace: function() {
    const err = new Error();
    console.log(err);
    return err.stack;
  },

  stackLines: function(from, to) {
    const err = new Error();
    const lines = err.stack.split('\n');
    return lines.slice(from, to).join('\n');
  },

  error: function(where, msg, obj) {
    if (this.logLevel < LOG_LEVEL_ERROR) {
        return;
    }
    obj = obj || '';
    console.error(this.cols.error(where), this.cols.error(msg), obj);

    const stackLines = this.stackLines(3, 10);
    where = 'ERROR: ' + stackLines + '\n / ' + where;
    console.log(stackLines);
  },

  // move to TextLib
  // does ~same as dashedName() method so remove this one
  sanitize: function(str, opts) {
    if (opts && opts.spaces) {
      str = str.replace(/\s/g, '-');
    }
    str = str.toLowerCase();
    str = str.replace('.md', '');
    str = str.replace(/([^a-z0-9áéíóúñü_@\-\s]|[\t\n\f\r\v\0])/gim, '');
    return str;
  },

  // display filenames replace the - with a space
  namify: function(str) {
    str = str.replace(/-/g, ' ');
    return str;
  },

  asFileName: function(str) {
    if (str) {
      str = str.replace(/ /g, '-');
    }
    str = str.toLowerCase();
    return str;
  },

  // text is optional if we want URL to be different from displayed text
  linkify: function(path, where, text) {
    let host;

    where = where || 'wiki';
    text = text || path;
    if (!path) {
      Utils.error('tried to linkify an empty item');
      return '-----';
    }
    // not URL encoded
    path = path.replace('?', '%3F');

    switch (where) {
      case 'gitter':
      case 'camperbot':
        host = AppConfig.gitterHost + AppConfig.getBotName() + '/';
        break;
      case 'wiki':
        host = AppConfig.wikiHost;
        break;
      default:
        break;
    }

    const uri = host + path;
    const name = Utils.namify(text);
    const link = '[' + name + '](' + uri + ')';
    Utils.clog('Utils.linkify>', 'link', link);
    return link;
  },

  splitParams: function(text) {
    if (typeof text !== 'string') {
      this.warn('splitParams>', 'text is not a string');
      return null;
    }

    let params;
    const parts = text.split(' ');
    const keyword = parts.shift();

    if (parts.length > 0) {
      params = parts.join(' ');
    }
    const res = {
      keyword: keyword,
      params: params
    };

    return res;
  },

  checkNotNull: function(item, msg) {
    if (item) {
      // means OK
      return true;
    } else {
      Utils.error(msg);
      return false;
    }
  },

  isObject: function(obj, errmsg) {
    errmsg = errmsg || 'not an object';

    if (typeof obj === 'object') {
      // means OK
      return true;
    } else {
      this.error(errmsg, obj);
      return false;
    }
  },


  makeMdnLinks: function(items) {
    let out = '';
    if (!items) {
      Utils.error('tried to makeMdnLinks for no items');
      return '';
    }
    items.forEach(one => {
      out += '\n- [' + one + '](' + MDNlinks[one] + ')';
    });
    return out;
  },

  timeStamp: function(when, baseDate) {
    let month;
    let day;
    baseDate = baseDate || new Date();
    const d1 = new Date();

    switch (when) {
      case 'yesterday':
      default:
        d1.setDate(baseDate.getDate() - 1);
    }

    month = d1.getMonth() + 1;
    month = _.padLeft(month, 2, '0');

    day = d1.getDate();
    day = _.padLeft(day, 2, '0');

    const timestamp = d1.getFullYear() + '/' + month + '/' + day;
    return timestamp;
  },

  hasProperty: function(obj, prop, msg) {
    if (obj && obj.hasOwnProperty(prop)) {
      return true;
    }
    msg = msg || 'ERROR';
    Utils.error(msg);
    Utils.error('missing property', prop, obj);
    return false;
  },

  betaFooter: function() {
    return '\n\n >this feature is linked to our [beta site](beta.freecodecamp' +
      '.org), so it may not have all users til we go live with the new ' +
      'release. Also check that FCC ID matches githubID!';
  }
};

Utils.logLevel = parseInt(process.env.LOG_LEVEL || 4, 10);

module.exports = Utils;
