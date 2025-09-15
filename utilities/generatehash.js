// moduel dependencies
const crypto = require('crypto');

/**
 * @name generateHash
 * @description Generate an HMAC-SHA256 hash from a payload
 * @param {string|object|array} payload - Input data
 * @param {string} secret - Secret key (non-empty string)
 * @param {object} options - Options { strict: boolean }
 * @returns {string|null} - Hex-encoded hash or null if invalid
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
const generateHash = (payload, secret, options = { strict: false }) => {

   // handleError function defination
   const handleError = (msg) => {
      if (options.strict) {
         const error = new Error(`InputError: ${msg}`);
         error.name = 'InputError'
         throw error;
      };

      return null;
   };

   try {
      if (!payload) {
         return handleError('Invalid payload');
      };

      if (!secret || typeof secret !== 'string' || !secret.trim().length) {
         return handleError('Invalid secret, it must be a non-empty string');
      };

      if (typeof payload === 'string' && !payload.trim().length) {
        return handleError('Inavlid payload, it can not be an empty string'); 
      };

      if (typeof payload === 'object' && !Array.isArray(payload) && !Object.keys(payload).length) {
         return handleError('Invalid payload, it can not be an empty object');
      };

      if (typeof payload === 'object' && Array.isArray(payload) && !payload.length) {
        return handleError('Invalid payload, it can not be an empty array'); 
      };

      const normalizedPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);

      const hash = crypto.createHmac('sha256', secret).update(normalizedPayload).digest('hex');
      return hash;
   } catch (error) {
      return null
   };
};

// export the genereateHash 
module.exports = generateHash;