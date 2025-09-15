// Module Dependencies
const crypto = require('crypto');

/**
 * @name createToken
 * @description Creates a JWT-like token by encoding a payload and signing it with HMAC-SHA256.
 * The token consists of three parts (header, payload, signature) separated by dots.
 * 
 * - The `header` contains metadata about the algorithm and token type.
 * - The `payload` contains user-defined claims along with automatically added `iat` (issued at)
 *   and `exp` (expiration time) claims.
 * - The `signature` is generated using the provided secret to ensure the token's integrity.
 * 
 * This method is intended for lightweight or custom token handling, not as a full JWT
 * replacement for production use
 * @param {String | Object | Array | Number} payload - Payload to be signed
 * @param {String} secret - Secret string for the token
 * @param {Object} options - An options object adding extra behaviour to the token 
 * @param {String|Number} options.expiresIn - Expiration time (e.g. "1h", "30m", "10s", 3600)
 * @param {Boolean} options.strict - Throw errors instead of returning null
 * @returns {String|null} token - A JWT-like token
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
const createToken = (payload, secret, { expiresIn = '1h', strict = false } = {}) => {

   const parseExpiry = (expiresIn) => {
      if (typeof expiresIn === 'number') return expiresIn;
      if (typeof expiresIn !== 'string') return 3600 // default 1h

      const match = expiresIn.match(/^(\d+(?:\.\d+)?)([smhdw])$/);
      if (!match) {
         if (strict) {
            const expiresInError = new Error(`Invalid expiresIn formate: ${expiresIn}`);
            expiresInError.name = 'ExpiresInError';
            throw expiresInError;
         };

         return 3600; // default 1h in seconds
      };

      const value = parseFloat(match[1]);
      const unit = match[2];

      if (unit === 's') return value;
      if (unit === 'm') return value * 60; // 1 minute in seconds
      if (unit === 'h') return value * 3600; // 1 hour in seconds
      if (unit === 'd') return value * 86400; // 1 day in seconds
      if (unit === 'w') return value * 604800 // 1 week in seconds

      return 3600;
   };

   try {
      // validate the payload
      if (!payload || typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
         if (strict) {
            const payloadError = new Error('Invalid token payload: must be a non-null object');
            payloadError.name = 'TokenPayloadError'
            throw payloadError
         };

         return null;
      };

      // validate the secret
      if (!secret || typeof secret !== 'string' || !secret.trim().length) {
         if (strict) {
            const secretError = new Error('Invalid token secret');
            secretError.name = 'TokenSecretError';
            throw secretError;
         };

         return null;
      };

      // create the header and convert it to base64url string
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');

      // noramly the Date.now() returns current time in milliseconds
      // but we need it in seconds so we divide it by 1000 
      // and use Math.floor() to round it down to the nearest whole number
      // if expiresIn is a string like '1h', we convert it to seconds
      const iat = Math.floor(Date.now() / 1000);
      const exp = Math.floor(Date.now() / 1000) + parseExpiry(expiresIn);

      // create the body and convert it to base64url string
      // we add the exp property to the payload
      const body = Buffer.from(JSON.stringify({ ...payload, iat, exp })).toString('base64url');

      // create the signature using HMAC with SHA256 algorithm
      // and convert it to base64url string
      const signature = crypto.createHmac('sha256', String(secret)).update(`${header}.${body}`).digest('base64url');

      // create token in the format of header.body.signature
      const token = `${header}.${body}.${signature}`;

      // return the token
      return token;
   } catch (error) {
      if (strict) throw error;

      return null;
   };
};

// Export the createToken module
module.exports = createToken;