/**
 * @name environment
 * @description store and share all the environment variables with the external files
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 * @date 15/09/2025
 */

// import dependencies

// module scaffolding
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

// export the environment variables
module.exports = environment[process.env.NODE_ENV || 'development'];