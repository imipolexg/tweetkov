'use strict';
const MongoClient = require('mongodb').MongoClient;
const async = require('async');

module.exports = function(ctx, done) {
  MongoClient.connect(ctx.data.MONGO_URI, (err, db) => {
    if (err) {
      done(err, null);
      return;
    }

    parse_tweet(db, ctx.data.tweet, (err, result) => {
      db.close();

      if (err) {
        done(err, null);
        return;
      }

      done(null, result);
    });
  });
}

function parse_tweet(db, tweet, callback) {
  let words = tweet.split(/\s+/);

  // A two-word prefix produces better results than a one-word prefix
  if (words.length < 3) {
    callback(null, "3 word minimum");
    return;
  }

  let tasks = [];
  for (let i = 0; i < words.length - 2; i++) {
    let prefix = words[i] + ' ' + words[i+1];
    let suffix = words[i+2];

    tasks.push((callback) => {
      add_suffix(db, prefix, suffix, callback);
    })
  }

  async.parallel(tasks, (err, result) => {
    callback(err, result);
  });
}

function add_suffix(db, prefix, suffix, callback) {
  db.collection('markov')
    .updateOne({
        prefix: prefix
      }, {
        $push: {
          suffix: suffix
        }
      }, {
        upsert: true
      },
      (err, result) => {
        if (err) {
          callback(err, null);
          return;
        }

        callback(null, "done.");
      }
    )
}
