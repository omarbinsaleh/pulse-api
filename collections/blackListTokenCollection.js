// dependencies
const createDb = require('../lib/my-db');

// intialize database and create a colletion for blacklist token
const db = createDb('pulseDB');
const blacklistTokenCollection = db.createCollection('blacklist_tokens');

blacklistTokenCollection.isTokenBlacklisted = function (tokenIdentifier, cb) {
   cb = typeof cb === 'function' ? cb : (err, isBlacklisted) => {};
   this.read(tokenIdentifier, (err, doc) => {
      if (err) {
         if (err.name === 'NotFoundError') {
            return cb(null, false);
         }

         return cb(err, false);
      }
      
      return cb(null, true);
   })
}

// export the blacklistTokenCollection
module.exports = blacklistTokenCollection;