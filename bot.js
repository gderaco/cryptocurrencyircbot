var irc = require('irc');
const request = require('request'), url = 'https://api.coinmarketcap.com/v1/ticker/', channel = '##abc'

var client = new irc.Client('irc.freenode.org', 'btcb0t', {
  channels: [channel],
});

client.addListener('message', function (from, to, message) {

  if (message == '!vol') {
    getVolume(function (currency) {
      var message = currency.map(function (item, i) {
          return boldify("["+item.symbol+"]")+ " $"+ prettifyNumber(parseFloat(item["24h_volume_usd"]))
        })
        .join(" ");
        client.say(channel,message);
    });
  }
  else if (message.startsWith('!')) {
    getCurrency(message.substring(1), function (currency) {

      if (currency != null) {
        var btcToUsd = parseFloat(currency.price_usd) / parseFloat(currency.price_btc)
        var marketCapInBtc = parseFloat(currency.market_cap_usd) / btcToUsd;
        client.say(channel,
          "("+currency.rank+") "+ 
          boldify("["+currency.symbol+"] ") + 
          boldify("Price(Ƀ/$): ") + currency.price_btc + "/" + currency.price_usd + " ~ " +
          boldify("%(H/D/W)[$]: ") + prettifyNumber(currency.percent_change_1h,true) + "/" + prettifyNumber(currency.percent_change_24h,true) + "/" + prettifyNumber(currency.percent_change_7d,true) + " ~ " +
          boldify("MarketCap(Ƀ/$) : ") + prettifyNumber(Math.round(marketCapInBtc)) + "/" + prettifyNumber(Math.round(currency.market_cap_usd)));
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

function getVolume(callback) {
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      var currencies = JSON.parse(body)
        .filter(function (item) {
          return item["24h_volume_usd"] != null;
        })
        .sort(function (a, b) {

          var volumeA = parseFloat(a["24h_volume_usd"]);
          var volumeB = parseFloat(b["24h_volume_usd"]);

          if (volumeA < volumeB) return 1;
          if (volumeA > volumeB) return -1;
          return 0;
        })
        .slice(0, 10)

      callback(currencies);
    } else {
      console.log("Got an error: ", error, ", status code: ", response.statusCode)
      callback(null)
    }
  })
}

boldify = function(text) {return irc.colors.wrap("bold", text)}

prettifyNumber = function (x,color = false) {
  var formattedString = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if(!color) return formattedString;
  if(x > 0)
  {
    return irc.colors.wrap("dark_green", formattedString)
  }
  else
  {
    return irc.colors.wrap("dark_red", formattedString)
  }
}