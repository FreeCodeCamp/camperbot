'use strict';

const Utils = require('../../../lib/utils/Utils');
const HttpWrap = require('../../../lib/utils/HttpWrap');
const TextLib = require('../../../lib/utils/TextLib');
const GitterHelper = require('../../../lib/gitter/GitterHelper');

const welcome = {

  hello: function(input, bot) {
    Utils.hasProperty(input, 'message', 'hello expects an object');
    if (input.params && input.params.match(/world/i)) {
      console.log(input.message.model.fromUser)
      const user = input.message.model.fromUser.username
      const userId = input.message.model.fromUser.id;
      const userDmLink = input.message.model.fromUser.id.url;
      const roomOrigin = input.message.room.name;
      const options = {
        method: 'POST',
      };
      const apiPath = '/api/v1/rooms/' + user + '/';
      HttpWrap.callApi(apiPath, options, () => {
         const message =
        '### :rocket: Welcome to Free Code Camp\'s chat rooms on Gitter :+1:' +
        '\n\nFree Code Camp is a friendly place to learn to code.' +
          'We’re committed to keeping it that way.' +
        '\n\nBe nice. Be helpful. And please read and abide by our' +
          'Code of Conduct.' +
        '\n\nHere are some of our official chat rooms:' +
        '\n* [FreeCodeCamp](https://gitter.im/FreeCodeCamp/FreeCodeCamp),' +
          'our main chat room - hang out and chat about life and learning' +
          'to code' +
        '\n* [Help](https://gitter.im/FreeCodeCamp/Help)' +
          ' - get coding help from your fellow campers' +
        '\n* [CodeReview](https://gitter.im/FreeCodeCamp/CodeReview)' +
          ' - give and receive constructive feedback from your' +
          'fellow campers on your projects' +
        '\n* [YouCanDoThis](https://gitter.im/FreeCodeCamp/YouCanDoThis)' +
          ' - learning to code is hard - ' +
          'share your feelings and get moral support here' +
        '\n* [CodingJobs](https://gitter.im/FreeCodeCamp/CodingJobs)' +
          ' - chat about the process of getting a coding job, ' +
          'such as portfolios, networking, and interviewing' +
        '\n* [Casual](https://gitter.im/FreeCodeCamp/Casual)' +
          ' - you can chat about your non-coding interests with other' +
          ' campers here' +
        '\n* [Contributors](https://gitter.im/FreeCodeCamp/Contributors)' +
          ' - help us improve our open source platform and curriculum' +
        '\n\nHappy coding!';
        return GitterHelper.sayToRoomName(message, userDmLink)
      })

    }
  }
};

module.exports = welcome;