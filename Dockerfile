FROM node:10

ADD cryptobot /ircbot
CMD cd /ircbot && ls -la && npm install && npm start