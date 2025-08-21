const createDb = require('../lib/my-db/');

// Initialize the database
const db = createDb('pulseDB');
const usersCollection = db.createCollection('users');

// export the users collection
module.exports = usersCollection;