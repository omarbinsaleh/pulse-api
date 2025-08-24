const createDb = require('../lib/my-db/index.js');
const utilities = require('../helpers/utilities.js');

// Initialize the database
const db = createDb('pulseDB');
const usersCollection = db.createCollection('users');

usersCollection.hashPassword = function () {
   const hashedPassword = utilities.generateHashedPassword(this.password);
   this.password = hashedPassword;
   return this.password
};

// export the users collection
module.exports = usersCollection;