// dependencies
const createDb = require('../lib/my-db');

// create database and database collection for the checks
const db = createDb('pulseDB');
const checksCollection = db.createCollection('checks');

// export the collection
module.exports = checksCollection;