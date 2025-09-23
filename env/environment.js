// Define all environment configuration variables
const environment = {
   development: {
      PORT: 3000,
      SECRET: 'this_is_the_token_secret_key_for_development',
      maxChecksLength: 5,
      minPasswordLength: 6,
      minPhoneLength: 11
   },
   stage: {
      PORT: 3500,
      SECRET: 'this_is_the_token_secret_key_for_stage',
      maxChecksLength: 5,
      minPasswordLength: 6,
      minPhoneLength: 11
   },
   production:{
      PORT: 4000,
      SECRET: 'this_is_the_token_secret_key_for_production',
      maxChecksLength: 5,
      minPasswordLength: 6,
      minPhoneLength: 11
   }
};

/**
 * @name enviornmentConfig
 * @description
 * Stores and provides environment-specific configuration variables for
 * different application modes (`development`, `stage`, `production`).
 * 
 * The correct configuration is automatically selected based on the value of
 * `process.env.NODE_ENV`. If `NODE_ENV` is not set, it defaults to `"development"`.
 *
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 * @date 15/09/2025
 * @lastUpdate 23/09/2025
 *
 * @returns {Object} Environment configuration object
 * @property {number} PORT - The port number the server should run on.
 * @property {string} SECRET - Secret key used for token signing.
 * @property {number} maxChecksLength - Maximum number of checks allowed per user.
 * @property {number} minPasswordLength - Minimum allowed password length.
 * @property {number} minPhoneLength - Minimum allowed phone number length.
 *
 * @example
 * // Assuming process.env.NODE_ENV = "production"
 * const config = require('./env/environment');
 * console.log(config.PORT); // 4000
 *
 * @example
 * // Without NODE_ENV (defaults to development)
 * const config = require('./env/environment');
 * console.log(config.SECRET); // "this_is_the_token_secret_key_for_development"
 */
const enviornmentConfig = environment[process.env.NODE_ENV || 'development'];

// export the environment variables
module.exports = enviornmentConfig