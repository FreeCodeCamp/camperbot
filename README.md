# CamperBot

[![Join the chat at https://gitter.im/FreeCodeCamp/camperbot](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/FreeCodeCamp/camperbot) [![Stories in Ready](https://badge.waffle.io/FreeCodeCamp/camperbot.png?label=ready&title=Ready)](https://waffle.io/FreeCodeCamp/camperbot)

This is a full featured bot for
[Gitter.im/FreeCodeCamp](https://gitter.im/orgs/FreeCodeCamp/rooms) chat rooms.

**Main features:**

-   integration with github FCC wiki
-   `find` (alias `explain`) command to show wiki pages
-   wrapper for commands

The CamperBot is integrated into various FreeCodeCamp chat rooms.

Join us in
[Gitter.im/FreeCodeCamp/camperbot](https://gitter.im/FreeCodeCamp/camperbot)
to discuss about camperbot development!

Test the CamperBot in the
[Gitter.im/FreeCodeCamp/camperbotPlayground](https://gitter.im/FreeCodeCamp/camperbotPlayground)
room.

CamperBot was originally created by for [Free Code Camp](http://www.freecodecamp.com) by [@dcsan](https://github.com/dcsan) at [RIKAI Labs](mailto:dc@rikai.co), and is now maintained by our open source community.

## Contents
-   [Introducing CamperBot!](https://github.com/FreeCodeCamp/camperbot/#introducing-camperbot)
-   [Installation instructions](https://github.com/FreeCodeCamp/camperbot/#installation-instructions)
  -   [Mac / Linux](https://github.com/FreeCodeCamp/camperbot/#mac--linux)
  -   [Windows](https://github.com/FreeCodeCamp/camperbot/#windows)
  -   [Getting your own appID](https://github.com/FreeCodeCamp/camperbot/#getting-your-own-appid)
  -   [Running tests](https://github.com/FreeCodeCamp/camperbot/#running-tests)
  -   [Wiki Content](https://github.com/FreeCodeCamp/camperbot/#wiki-content)
-   [System Overview](https://github.com/FreeCodeCamp/camperbot/#system-overview)
  -   [Room Joins](https://github.com/FreeCodeCamp/camperbot/#dataroomdatajs)
  -   [Bot Commands](https://github.com/FreeCodeCamp/camperbot/#libbotbotcommandsjs)
  -   [Wiki Data](https://github.com/FreeCodeCamp/camperbot/#kbasejs)
  -   [Room Messages](https://github.com/FreeCodeCamp/camperbot/#roommessagesjs)
-   [Create own bot](https://github.com/FreeCodeCamp/camperbot/#how-to-add-a-new-bot-command)
-   [Bot command details](https://github.com/FreeCodeCamp/camperbot/#more-detail-on-how-commands-are-found-and-called)
-   [Environment Notes](https://github.com/FreeCodeCamp/camperbot/#environment-notes)
-   [Contributing](https://github.com/FreeCodeCamp/camperbot/#contributing)
-   [Chat with us!](https://github.com/FreeCodeCamp/camperbot/#chat-with-us)

## Introducing CamperBot!

CamperBot is a full featured chat bot for [Gitter.im](https://gitter.im)
developed to integrate with the chat rooms for
[FreeCodeCamp &mdash; the largest online coding bootcamp in the world](http://www.freecodecamp.com/)
, where it serves more than 60,000 campers.

### Github Wiki Search

You can search for articles in a projects github wiki
![](https://freecodecamp.github.io/camperbot/images/anims/find.gif)

### Share wiki summaries in chat

Use `explain` to pull a wiki summary right into the chat:
![](https://freecodecamp.github.io/camperbot/images/anims/explain.gif)

### Points system

Allow your users to send points to each other to say `thanks @username`
![](https://freecodecamp.github.io/camperbot/images/anims/points.gif)

### Fixed messages

Based on scannable expressions, send messages into the chat.

### Extensible

Custom functions can easily be added. Check the [System Overview](https://github.com/FreeCodeCamp/camperbot#system-overview)

## Installation instructions

To run camperbot, you need [Node.js](https://nodejs.org/) 4.2.0 or greater.

### Mac / Linux

To install Node, [follow the instructions here](http://blog.teamtreehouse.com/install-node-js-npm-mac)

-   To make your the local server automatically watch for file changes,
    install "nodemon" (you may need `sudo`)

```sh
sudo npm install -g nodemon
```

-   To download the app, clone the repository the bot is in:

```sh
git clone https://github.com/FreeCodeCamp/camperbot.git
```

-   Run the following commands to run the app:

```sh
cd camperbot
cp dot-EXAMPLE.env dot.env
git submodule update --remote --checkout --init --recursive
npm install
nodemon app.js
```

-   That's it! The app should be running at
    [http://localhost:7891](http://localhost:7891).

You can now chat to your bot via [Gitter.im](https://gitter.im) at
[https://gitter.im/demobot/test](https://gitter.im/demobot/test)

### Windows

To install Node.js on Windows, [follow these instructions](http://blog.teamtreehouse.com/install-node-js-npm-windows).

-   To make your the local server automatically watch for file changes,
    install "nodemon" in an administrator console.

```sh
npm install -g nodemon
```

-   To download the app, clone the repository the bot is in:

```sh
git clone https://github.com/FreeCodeCamp/camperbot.git
```

-   Run the following commands to run the app:

```sh
cd camperbot
copy dot-EXAMPLE.env dot.env
git submodule update --remote --checkout --init --recursive
npm install
nodemon app.js
```

-   That's it! The app should be running at [http://localhost:7891](http://localhost:7891).

You can now chat to your bot via [Gitter.im](https://gitter.im) at
[https://gitter.im/demobot/test](https://gitter.im/demobot/test)

### Getting your own appID

The `dot.env` file you copied above contains login info.
This is using the shared "demobot" account so you may find yourself in a
chatroom with other people using the same ID!

To setup your own gitter login info, you should create your own Gitter API key
on their developer site, and replace the info in that `.env` file.
Get your own API keys for gitter from:
[https://developer.gitter.im/apps](https://developer.gitter.im/apps)

For more settings info, checkout the `AppConfig.js` and `RoomData.js` files.
These define which rooms the bot will listen in to.

You may chat with us in the CamperBot Dev chat room if you have problems. [camperbot chatroom](https://gitter.im/FreeCodeCamp/camperbot).

### Running tests

Tests are located in the `test/` folder can be run, along with linting,
by running `gulp`.
This is a watch task that will rerun whenever a `.js` file changes.

## Wiki Content

The wiki content is pulled in from FCC's wiki using a git submodule.
But then we just copy it and commit it back to the main app as submodules
are nasty to deal with on production servers.

```sh
bin/wiki-update.sh
```

## System Overview

### data/RoomData.js

The list of rooms your bot is going to join.

To start with create your own bot, a test room to enter and debug in.
This needs to be changed so you would only join your own rooms, otherwise
developers will get into a situation where everyone is joining the same
rooms and the bots go crazy talking to each other!

### lib/bot/BotCommands.js

This is where you add things that the bot can do. Some commands are broken
into separate files such as `cmds/thanks.js` and `cmds/update.js`.
Each command gets a `input` which is a blob of data including what the user
entered, and a bot instance.

### KBase.js

The Knowledge base. This is an interface to all the data in the wiki.

### RoomMessages.js

This is for static messages that are fired based on regex matches.
If you just want to add some basic responses, this is the place to edit.

### How to add a new Bot Command

Look at `BotCommands`, `echo` function. This is an example of a command being
called. Anytime a user types a line starting with `echo` that will get passed
to this function in input.

```js
echo: function(input, bot) {
    var username = input.message.model.fromUser.username;
    return "@" + username + " said: " + input.message.model.text;
}
```

The input object contains `keyword` and `params` fields.
If you type `echo this` you'll get

```js
//input
{   
    keyword: 'echo',
    params: 'this'
}
```

From any command you just return the new string you want to output.
So you can add new commands with this knowledge.

### More detail on how commands are found and called

In `GBot.js`

```js
if (input.command) {
    // this looks up a command and calls it
    output = BotCommands[input.keyword](input, this);
} else {
```

`BotCommands` is a list of functions. E.g.

```js
BotCommands.thanks = function() { ... }
```

where `input.keyword` is `thanks` then

`BotCommands[input.keyword]` is like saying `BotCommands.thanks()`

so then the params get also added in `(input, this)` so its

```js
BotCommands[input.keyword](input, this);
//becomes
BotCommands.thanks(input, bot);
```

All of the bot commands expect these two params. E.g. in `thanks.js`

```js
var commands = {
    thanks: function (input, bot) {
```

In `RoomMessages.js` we also have a table of regex and matching functions.

```js
{
    regex: /\bth?a?n?[xk]s?q?\b/gim,
    func: BotCommands.thanks
}
```

> We may switch all to just use this method in future. Would you like to help?

## Environment Notes

### wiki data

We use git submodules for some wiki data. to get these submodules you would do:

```sh
git submodule update --remote --checkout --init --recursive
```

## Contributing

Have a look at the
[HelpWanted](https://github.com/FreeCodeCamp/camperbot/issues?q=is%3Aopen+label%3A%22help+wanted%22)
label issues and consider making some first steps!

The labels, P1 = priority one, and 'S' means a small task,
so good places to start.

## Chat with us!

Chat with us in the
[camperbot chatroom](https://gitter.im/FreeCodeCamp/camperbot) if you get stuck.
