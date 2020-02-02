FROM node:10

ARG configfile=~/.local/share/cryptocurrencyircbot/config.json

ADD cryptobot /ircbot
ADD configfile /ircbot/config.json
CMD cd /ircbot && ls -la && npm install && npm start