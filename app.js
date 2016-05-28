'use strict';

require('dotenv').config({ path: 'dot.env' });

console.log('--------------- startup ------------------');

if (typeof Map !== 'function' ) {
  throw new Error('ES6 is required; add --harmony');
}

const GBot = require('./lib/bot/GBot');

GBot.init();
