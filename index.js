const FeedParser = require('feedparser');
const request = require('request');

const loadFeed = () => {
  const req = request('http://friendsatthetable.net/rss');
  const feedparser = new FeedParser();
  const feed = [];

  return new Promise((resolve, reject) => {
    req.on('response', function (res) {
      if (res.statusCode !== 200) {
        reject(res.statusCode);
      } else {
        this.pipe(feedparser);
      }
    });
     
    feedparser.on('error', reject)
     
    feedparser.on('readable', function () {
      let item;
    
      while (item = this.read()) {
        if (item) feed.push(item);
      }
    });

    feedparser.on('end', () => resolve(feed.reverse()));
  });
};

const parseDur = ep => {
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

function * upTo ([ ep, ...feed ], title) {
  if (!ep) return;
  if (ep.title.includes(title)) return yield ep;
  yield ep;
  yield * upTo(feed, title);
}

async function main () {
  const title = process.argv[2]
  if (!title) return console.log('please supply a full episode title you\'ve completed up to');
  
  const feed = await loadFeed();
  const dur = [...upTo(feed, title)].map(parseDur).reduce((a, b) => a + b, 0);
  console.log(dur / 3600, 'hours');
}

main();
