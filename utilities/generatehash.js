// moduel dependencies
const crypto = require('crypto');
const evn = require('../env/environment.js');

// @name: genereateHashedPassword
// @desc: Generate a hashed password
// @auth: Omar Bin Saleh
const generateHash = (payload, secrete) => {
   try {
      if (!payload || typeof payload !== 'string' || typeof secrete !== 'string') {
         throw new Error('IntutError: payload and the secret must be a string');
      }

      const hash = crypto.createHmac('sha256', secrete).update(payload).digest('hex');
      return hash;
   } catch (error) {
      throw new Error(error);
   };
};

// export the genereateHash 
module.exports = generateHash;