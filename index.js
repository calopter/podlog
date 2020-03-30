const FeedParser = require('feedparser');
const request = require('request');
 
const req = request('http://friendsatthetable.net/rss');
const feedparser = new FeedParser();

function parseDur (ep) {
  if (!ep) return;
  
  let [h, m, s] = ep['itunes:duration']['#'].split(':').map(t => +t);
  
  if (!s) {
    s = m;
    m = h;
    h = 0;
  }

  let dur = s;
  dur += m * 60;
  dur += h * 3600;
  
  return dur;
}
 
req.on('response', function (res) {
  const stream = this;
 
  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});
 
feedparser.on('error', function (error) {
  // always handle errors
});
 
feedparser.on('readable', function () {
  const stream = this;
  let item;
  let total = 0;
 
  while (item = stream.read()) {
    console.log(parseDur(item));
  }
});
