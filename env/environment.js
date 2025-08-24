// import dependencies

// module scaffolding
const env = {
   development: {
      PORT: 3000,
      SECRET: 'this_is_the_token_secret_key_for_development'
   },
   stage: {
      PORT: 4000,
      SECRET: 'this_is_the_token_secret_key_for_development',
   },
   production:{
      PORT: 5000,
      SECRET: 'this_is_the_token_secret_key_for_development',
   }

};

// export the environment variables
module.exports = env[process.env.NODE_ENV || 'development'];