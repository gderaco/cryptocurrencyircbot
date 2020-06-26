FROM node:10
ADD cryptobot /ircbot
CMD cd /ircbot && npm install && npm start