// module dependecies
const crypto = require('crypto');

/**
 * @name verifyToken
 * @description Verifies a JWT-like token by checking its structure, signature, and expiration.
 * 
 * - Ensures the token is a valid string in the format `header.payload.signature`.
 * - Recomputes the HMAC-SHA256 signature using the provided secret and compares it securely
 *   against the token’s signature.
 * - Decodes and parses the payload, ensuring it contains a valid `exp` (expiration time).
 * - Rejects the token if it is malformed, the signature is invalid, or the token has expired.
 * 
 * This method is intended for lightweight or custom token validation, not as a full JWT
 * replacement for production use.
 * @param {String} token - The token string in the format header.body.signature
 * @param {String} secret - Secret string used to sign the token
 * @param {Function} cb - Callback function with signature (err, payload)
 * 
 * @throws {InvalidTokenError} - If the token is not a valid string or format
 * @throws {InvalidSignatureError} - If the token signature does not match
 * @throws {InvalidPayloadError} - If the payload is not valid JSON
 * @throws {InvalidExpiryError} - If the payload is missing or has invalid `exp`
 * @throws {TokenExpiredError} - If the token has expired
 * 
 * @returns {void} Calls cb with either (error, null) or (null, payload)
 * 
 * @example
 * mytoken.verify(token, 'mySecret', (err, payload) => {
 *   if (err) {
 *     console.error(err.name, err.message);
 *   } else {
 *     console.log('Token is valid:', payload);
 *   }
 * });
*/
// module defination
const verifyToken = (token, secret, cb) => {
   // ensure cb is a function
   cb = typeof cb === 'function' ? cb : (err, payload) => { };

   try {
      // check if the token is a non-empty string
      // if not, return an error
      if (!token || typeof token !== 'string') {
         const error = new Error('Token must be a non-empty string');
         error.name = 'InvalidTokenError';
         return cb(error, null);
      };

      // check if the token has three parts separated by dots
      // if not, return an error
      const [header, body, signature] = token.split('.');
      if (!header || !body || !signature) {
         const error = new Error('Invalid token format');
         error.name = 'InvalidTokenError';
         return cb(error, null);
      };

      // verify the signature
      // if the signature is invalid, return an error
      const expectedSignature = crypto.createHmac('sha256', String(secret)).update(`${header}.${body}`).digest('base64url');
      if (signature !== expectedSignature) {
         const error = new Error('Invalid token signature');
         error.name = 'InvalidSignatureError';
         return cb(error, null);
      };

      // decode the body and parse it to an object
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString());

      // validate the expiration date
      if (!payload.exp || typeof payload.ex !== 'number') {
         const expiryError = new Error('Invalid token or invalid exp clain');
         expiryError.name = 'InvalidExpiryError';
         return cb(expiryError, null);
      };

      // then check if the token has expired
      // if the token has expired, return an error
      if (payload.exp < Math.floor(Date.now() / 1000)) {
         const error = new Error('Token has expired');
         error.name = 'TokenExpiredError';
         return cb(error, null);
      };

      // return the payload if the token is valid
      return cb(null, payload);
   } catch (error) {
      return cb(error, null);
   };
};

// export the verifyToken module
module.exports = verifyToken;