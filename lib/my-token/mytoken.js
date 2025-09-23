// Module Dependencies
const createToken = require('./createToken.js');
const verifyToken = require('./verifyToken.js');

// Module Scaffolding
const mytoken = {};

// Method for token generation
mytoken.sign = createToken;

// Method for token verification
mytoken.verify = verifyToken;

/**
 * @name generateTokenIdentifier
 * @description Generates a unique identifier for a JWT-like token by extracting its signature part.
 * @param {String} tokenString - A JWT-like token in the format header.payload.signature
 * @returns {String|null} The signature part of the token, or null if invalid
 * @author Omar Bin Saleh
 */
mytoken.generateTokenIdentifier = (tokenString) => {
   if (typeof tokenString !== 'string' || !tokenString.trim().length) {
      return null;
   };

   if (tokenString.split('.').length !== 3) {
      return null;
   };

   const identifier = tokenString.split('.')[2].trim(); // retrieve the signiture part of the token
   if (!identifier || typeof identifier !== 'string' || !identifier.trim().length) {
      return null;
   }

   return identifier;
}

// export the mytoken module
module.exports = mytoken;