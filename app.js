const server = require('./server.js');
const services = require('./services');

// module scaffolding
const app = {};

app.init = () => {
   // initialize the server
   server.init();

   // initialize the services
   services.init();
}

// export the app module
module.exports = app;