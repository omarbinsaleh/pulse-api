// import dependencies
const createDb = require('../lib/my-db/index.js');
const utilities = require('../helpers/utilities.js');

// initialize the database
const db = createDb('pulseDB');
const tokenCollection = db.createCollection('tokens');

// export the tokens collection
module.exports = tokenCollection;