'use strict';

require('dotenv').config({ path: 'dot.env' });

console.log('--------------- startup ------------------');

if (typeof Map !== 'function' ) {
  throw new Error('ES6 is required; add --harmony');
}

const express = require('express'),
      port = process.env.PORT || 7891,
      passport = require('./lib/gitter/passportModule'),
      GBot = require('./lib/bot/GBot'),
      routes = require('./lib/app/routes.js'),
      path = require('path'),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser'),
      methodOverride = require('method-override'),
      session = require('express-session'),
      serveStatic = require('serve-static');     

const app = express();

// Middlewares
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(serveStatic(path.join(__dirname, '/public')));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());

GBot.init();
routes.init(app, GBot, passport);

app.listen(port);
console.log('Demo app running at http://localhost:' + port);
