


source bin/credentials-camperbot.sh

set -x

SERVER_ENV=prod \
BOT_APP_HOST=bot.freecodecamp.org \
GITTER_USER_TOKEN=${GITTER_USER_TOKEN} \
GITTER_APP_KEY=${GITTER_APP_KEY} \
GITTER_APP_SECRET=${GITTER_APP_SECRET} \
LOG_LEVEL=10 \
PORT=7891 \
    nodemon app.js
