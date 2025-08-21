// Import Dependencies
const crypto = require('crypto');

// Module Scaffolding
const utilities = {};

// @name: parseJSON
// @desc: validate the JSON data coming from the client and accept only valid JSON and parse it
// @auth: Omar Bin Saleh
utilities.parseJSON = (data) => {
   if (typeof data !== 'string') return {};

   try {
      return JSON.parse(data);
   } catch (error) {
      return {};
   }
};

// @name: genereateHashedPassword
// @desc: Generate a hashed password
// @auth: Omar Bin Saleh
utilities.generateHashedPassword = (password) => {
   if (!password || typeof password !== 'string') {
      throw new Error('IntutError: Password must be a string');
   }

   try {
      const hash = crypto.createHmac('sha256', String(process.env.NODE_SECRET)).update(password).digest('hex');
      return hash;
   } catch (error) {
      throw new Error(error);
   };
};

// Export the tilities module
module.exports = utilities;
