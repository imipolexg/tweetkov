'use strict';
const MongoClient = require('mongodb').MongoClient;

let wordCount;

module.exports = function(ctx, done) {
  wordCount = ctx.data.count || 35;

  MongoClient.connect(ctx.data.MONGO_URI, (err, db) => {
    if (err) {
      done(err, null);
      return;
    }

    let words = [];
    add_random_words(db, words, (err, result) => {
      db.close();

      if (err) {
        done(err, null);
        return;
      }

      done(null, result.join(' '));
    });
  });
}

function parse_result(result, words, prefix=false) {
  if (prefix) {
    words.push(result.prefix);
  }
  let randIndex = rand_index(result.suffix.length);
  let suffix = result.suffix[randIndex];
  words.push(suffix);

  return result.prefix.split(' ')[1] + ' ' + suffix;
}

// add_random_words and add_words chain together until the words array is the desired length, then they
// call the callback...
function add_random_words(db, words, callback) {
  if (words.length > wordCount) {
    callback(null, words);
    return;
  }

  db.collection('markov').aggregate({
    $sample: {
      size: 1
    }
  }, (err, result) => {
    let cursor = parse_result(result[0], words, true);
    add_words(db, cursor, words, callback);
  });
}

function add_words(db, cursor, words, callback) {
  if (words.length > wordCount) {
    callback(null, words);
    return;
  }

  db.collection('markov').findOne({
    prefix: cursor
  }, (err, result) => {
    if (err) {
      callback(err, null);
      return;
    }

    if (!result) {
      add_random_words(db, words, callback);
    } else {
      let cursor = parse_result(result, words)
      add_words(db, cursor, words, callback)
    }
  });
}

function rand_index(max) {
  return Math.floor(Math.random() * (max - 1));
}
