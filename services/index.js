// moduel dependencies
const checkServices = require('./check-services/checkServices.js');

// module scaffolding
const services = {};

// @name       : services.init
// @description: Initialize the services
// @author     : Omar Bin Saleh
// @contact    : omarbinsaleh44@gmail.com
services.init = () => {
   console.log('Services is initialized successfully');

   // monitor up and down status for each of the registered checks or urls
   checkServices.monitorChecksUrl();

   setInterval(() => {
      checkServices.monitorChecksUrl()
   }, 5000);
};

// export the services module
module.exports = services;