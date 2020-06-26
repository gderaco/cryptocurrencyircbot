### Instructions
1. rename `./cryptobot/config.json.sample` in `config.json`
2. change `config.json` accordingly
3. run with `cd ./cryptobot && ls -la && npm install && npm start` or `docker build -t ircbot . && docker run ircbot`

### Features
* given a link, the bot will say the title of the page

### Commands
* `!$crypto` (for istance `!siacoin`)
* `.j` will say a joke
* `.q $question-or-calculation-or-anything-else` will query wolfram alpha