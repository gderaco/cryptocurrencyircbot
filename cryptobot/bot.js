var irc = require('irc');
var he = require('he');
var request = require('request');
var config = require('./config.json')
let cryptoApiUrl = 'https://api.coingecko.com/api/v3/';

var client = new irc.Client(config.irc.server, config.irc.nickname, {
    channels: config.irc.channels
});

client.addListener('message', function (from, to, message) {
    try {
        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
        matches = message.match(regex);
        if (matches != null) {
            matches.forEach(function (element) {
                request.get(element, { timeout: 1000 }, function (err, res, body) {
                    if (err != null) return;
                    if (body == null) return;
                    var title = body.match(/<title>([^<]+)<\/title>/)
                    if (title != null && title.length > 0) {
                        client.notice(to, from + " ~ " + he.decode(title[1].replace(/\n|\r/g, "").trim()));
                    }
                });
            }, this);
        }
        else {
            if (message.startsWith('!')) {
                getCurrency(message.substring(1), function (currency) {
                    if (currency != null) {
                        client.notice(to, from + " ~ " +
                            "(" + currency.market_cap_rank + ") " +
                            boldify("[" + currency.symbol.toUpperCase() + "] ") +
                            boldify("Price(Ƀ/$): ") + currency.market_data.current_price.btc.toFixed(8) + "/" + currency.market_data.current_price.usd.toFixed(5) + " ~ " +
                            boldify("%(H/D/W)[$]: ") +
                            prettifyNumber(currency.market_data.price_change_percentage_1h_in_currency.usd.toFixed(2), true) + "/" +
                            prettifyNumber(currency.market_data.price_change_percentage_24h_in_currency.usd.toFixed(2), true) + "/" +
                            prettifyNumber(currency.market_data.price_change_percentage_7d_in_currency.usd.toFixed(2), true) + " ~ " +
                            boldify("MarketCap(Ƀ/$) : ") + prettifyNumber(currency.market_data.market_cap.usd) + "/" + prettifyNumber(currency.market_data.market_cap.btc));
                    }
                });
            }
            else if (message.startsWith('.q')) {

                replyToQuestion(message, function (answer) {
                    client.notice(to, answer);
                });
            }
            else if (message.startsWith('.j')) {

                getAJoke(function (joke) {
                    client.notice(to, joke);
                });
            }
            else if (message.startsWith('.y')) {

                getYoutubeVideoByQuery(message, function (video) {
                    client.notice(to, video);
                });
            }
        }
    } catch (e) {
        console.log(e);
    }
});

function getCurrency(name, callback) {
    request(cryptoApiUrl + "coins/" + name, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            callback(JSON.parse(body))
        } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode)
            callback(null)
        }
    })
}

function boldify(text) { return irc.colors.wrap("bold", text) }

function prettifyNumber(x, color = false) {
    if (x == null) { x = "n.a." }
    var formattedString = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (!color) return formattedString;
    if (x > 0) {
        return irc.colors.wrap("dark_green", formattedString)
    }
    else {
        return irc.colors.wrap("dark_red", formattedString)
    }
}

function replyToQuestion(question, callback) {
    const transformedQuestion = escape(question.replace(/ /g, "+")).substring(3);

    const baseUrl = "https://api.wolframalpha.com/v1/result?i=";
    const appId = "&appid=";

    const requestUrl = baseUrl + transformedQuestion + appId + config.secrets.wolframalpha;

    request(requestUrl, function (error, response, body) {
        if (body != "Wolfram|Alpha did not understand your input" && body != "No short answer available" && body != null) {
            callback(body);
        }
    });
}

function getAJoke(callback) {
    var options = {
        url: "https://icanhazdadjoke.com/",
        headers: {
            'Accept': 'text/plain'
        }
    };
    request(options, function (error, response, body) {
        callback(body)
    });
}

function getYoutubeVideoByQuery(query, callback) {

    if (query.length == 0) return;

    var search = require('youtube-search');

    var opts = {
        maxResults: 1,
        order: 'relevance',
        type: 'video',
        key: config.secrets.youtube
    };

    search(query.replace(".y ", ""), opts, function (err, results) {
        if (err == null && results.length > 0) {
            let returnMessage = results[0].title + " - " + "https://youtu.be/" + results[0].id;
            var decode = require('unescape');

            callback(decode(returnMessage));
        }
    });
}
