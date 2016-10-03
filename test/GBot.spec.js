'use strict';

const test = require('tape');
const AppConfig = require('../config/AppConfig');
const GBot = require('../lib/bot/GBot');
const TestHelper = require('./TestHelper');
const KBase = require('../lib/bot/KBase');

function testMessage(command) {
    const message = TestHelper.makeMessageFromString(command);
    return GBot.findAnyReply(message);
}

test('GBot tests', t => {
  t.doesNotThrow(() => {
    KBase.initSync();
  }, 'kbase should load');

  t.equal(GBot.getName(), 'bothelp', 'bot should have a name');

  t.test('GBot should not reply to itself', st => {
    const botname = AppConfig.getBotName();
    const flag = GBot.isBot(botname);

    st.ok(flag);
    st.end();
  });

  t.test('GBot should parse wiki input', st => {
    const input = TestHelper.makeInputFromString('wiki bootstrap');
    const output = GBot.parseInput(input.message);

    st.equal(output.keyword, 'wiki', 'has correct keyword prop');
    st.equal(output.params, 'bootstrap', 'has correct params prop');
    st.end();
  });

  t.test('GBot should format non-help as false command', st => {
    const input = TestHelper.makeMessageFromString('DONT bootstrap');
    const output = GBot.parseInput(input);

    st.notOk(output.command, 'should return false');
    st.end();
  });

  t.skip('GBot should respond to wiki bootstrap', st => {
    const res = testMessage('wiki bootstrap');

    console.log(res);
    st.ok(res.includes('## :point_right: [bootstrap'));
    st.end();
  });

  t.test('GBot should have a botstatus response', st => {
    const res = testMessage('botstatus');

    st.ok(res.includes('All bot systems are go!'));
    st.end();
  });

  t.test('GBot should have a menu command', st => {
    const res = testMessage('menu');

    st.ok(res.includes('type help for a list'));
    st.end();
  });

  t.test('GBot should have a help command', st => {
    const res = testMessage('help');

    st.ok(res.includes('Hi, I\'m **[CamperBot]'));
    st.end();
  });

  t.test('GBot should send a thanks karma reply', st => {
    const res = testMessage('thanks @bob');

    st.equal(res.includes('@testuser sends brownie points to'), true);
    st.end();
  });

  t.test('GBot should have a find command', st => {
    const res = testMessage('find XXX');

    st.ok(res.includes('find **'));
    st.end();
  });

  t.end();
});
