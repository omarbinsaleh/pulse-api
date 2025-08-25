const createDb = require('../lib/my-db/index.js');
const utilities = require('../helpers/utilities.js');

// Initialize the database
const db = createDb('pulseDB');
const usersCollection = db.createCollection('users');

usersCollection.hashPassword = function (password) {
   const hashedPassword = utilities.generateHashedPassword(password);
   return hashedPassword;
};

usersCollection.comparePassword = function (password, hash) {
   const exprectedHash = utilities.generateHashedPassword(password);
   return exprectedHash === hash;
};

// export the users collection
module.exports = usersCollection;