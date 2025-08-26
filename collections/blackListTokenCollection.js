// dependencies
const createDb = require('../lib/my-db');

// intialize database and create a colletion for blacklist token
const db = createDb('pulseDB');
const blacklistTokenCollection = db.createCollection('blacklist_tokens');

// export the blacklistTokenCollection
module.exports = blacklistTokenCollection;