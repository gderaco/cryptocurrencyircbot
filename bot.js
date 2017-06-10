var irc = require('irc');
const request = require('request'), url = 'https://api.coinmarketcap.com/v1/ticker/', channel = '##cryptotrading'

var client = new irc.Client('irc.freenode.org', 'btcb0t', {
  channels: [channel],
});

var ircColors = require('irc-colors');

client.addListener('message', function (from, to, message) {
  if (message.startsWith('!')) {
    getCurrency(message.substring(1), function (currency) {

      if (currency != null) {
        var btcToUsd = parseFloat(currency.price_usd) / parseFloat(currency.price_btc)
        var marketCapInBtc = parseFloat(currency.market_cap_usd) / btcToUsd;
        client.say(channel,
          "Symbol: " + currency.name + " ~ Price(BTC/USD): "
          + currency.price_btc + "/" + currency.price_usd +
          " ~ %(H/D/W): " + currency.percent_change_1h + "/" + currency.percent_change_24h + "/" + currency.percent_change_7d
          + " ~ MarketCap(BTC/USD) : " + numberWithCommas(Math.round(marketCapInBtc)) + "/" + numberWithCommas(Math.round(currency.market_cap_usd)));
      }
    });
  }
});

function getCurrency(name, callback) {
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      var currency = JSON.parse(body).filter(function (item) {
        return item.id.toUpperCase().includes(name.toUpperCase()) || item.name.toUpperCase().includes(name.toUpperCase()) || item.symbol.toUpperCase().includes(name.toUpperCase())
      });
      if (currency.length > 0) {
        callback(currency[0])
      }
    } else {
      console.log("Got an error: ", error, ", status code: ", response.statusCode)
      callback(null)
    }
  })
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


