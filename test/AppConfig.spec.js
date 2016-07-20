'use strict';

var test = require('tape'),
    AppConfig = require('../config/AppConfig');

test('AppConfig test', t => {
  t.plan(2);

  t.equal(AppConfig.testUser, 'bothelp', 'should have default AppConfig');

  // t.test('should make a topicDmUri', (st) => {
  //   var topicDmUri = AppConfig.topicDmUri(),
  //       expUri = AppConfig.appHost + '/go?dm=y&room=bothelp';
  //   st.plan(1);
  //   st.equal(topicDmUri, expUri);
  //   st.end();
  // });

  t.equal(AppConfig.getBotName(), 'bothelp', 'should setup the botname');

  t.end();
});
