const createDb = require('../lib/my-db/index.js');
const utilities = require('../utilities');
const env = require('../env/environment.js');

// Initialize the database and create a collection for users
const db = createDb('pulseDB');
const usersCollection = db.createCollection('users');

// add hashPassword method to the user collection
usersCollection.hashPassword = function (password) {
   const hashedPassword = utilities.generateHash(password, env.SECRET);
   return hashedPassword;
};

// add comparePassword method to the user collection
usersCollection.comparePassword = function (password, hash) {
   const expectedHash = utilities.generateHash(password, env.SECRET);
   return expectedHash === hash;
};

// export the users collection
module.exports = usersCollection;