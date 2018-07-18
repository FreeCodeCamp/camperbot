'use strict';

const https = require('https');
const _ = require('lodash');
const AppConfig = require('../../config/AppConfig');
const Utils = require('./Utils');

const HttpWrap = {
  defaultOptions: {
    host: AppConfig.apiServer,
    port: 443,
    protocol: 'https:',
    timeout: 5000,
    debug: false,
    headers: {
      Authorization: AppConfig.apiKey
    }
  },

  callApi: function(apiPath, options, callback) {

    _.merge(this.defaultOptions, options);

    // TODO add authorisation to header
    this.defaultOptions.path = apiPath;

    const handleResponse = response => {
      let str = '';

      // another chunk of data has been received, so append it to `str`
      response.on('data', chunk => {
        str += chunk;
      });

      // the whole response has been recieved, so we just print it out here
      response.on('end', () => {
        try {
          const blob = JSON.parse(str);
          options.response = blob;
        } catch (err) {
          Utils.error('cant parse API response', str);
          Utils.error('error>', err);
          options.response = 'api offline';
        }
        callback(options);
      });
    };

    const handleTimeout = err => {
      Utils.error('HttpWrap', 'timeout', err);
    };

    const request = https.request(this.defaultOptions, handleResponse);
    request.setTimeout(5000, handleTimeout);
    request.end();
  }
};

module.exports = HttpWrap;
