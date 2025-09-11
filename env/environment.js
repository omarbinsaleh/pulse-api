// import dependencies

// module scaffolding
const env = {
   development: {
      PORT: 3000,
      SECRET: 'this_is_the_token_secret_key_for_development'
   },
   stage: {
      PORT: 3500,
      SECRET: 'this_is_the_token_secret_key_for_stage',
   },
   production:{
      PORT: 4000,
      SECRET: 'this_is_the_token_secret_key_for_production',
   }

};

// export the environment variables
module.exports = env[process.env.NODE_ENV || 'development'];