// moduel dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const checksCollection = require('../collections/checksCollection.js');
const utilities = require('../utilities');

// module scaffolding
const services = {};

// @name       : services.init
// @description: Initialize the services
// @author     : Omar Bin Saleh
// @contact    : omarbinsaleh44@gmail.com
services.init = () => {
   console.log('Services is initialized successfully');

   // monitor up and down status for each of the registered checks or urls
   monitorChecksUrl();

   setInterval(() => {
      monitorChecksUrl()
   }, 5000);
};

// @name       : monitorChecksUrl
// @description: a helper function to monitor the up and down time status of the registered checks url
// @author     : Omar Bin Saleh
// @contact    : omarbinsaleh44@gmail.com
const monitorChecksUrl = () => {
   console.log('Monitoring the checks urls for status changes....')

   // list out all the checks
   checksCollection.listDocsNames((err, docsNames) => {
      // handle the error occured while listing documents names
      if (err && !docsNames) {
         console.error(err);
         return 0;
      };

      // validate the type of the chechs names data
      const checksNames = docsNames;
      if (typeof checksNames !== 'object' || !Array.isArray(checksNames) || checksNames.length < 1) {
         console.log('Error: list of checks names returned by the listDocsNames method is not an array')
         return 0;
      };

      // perform Up or Down Time validation for each of the checks listed
      checksNames.forEach(checkName => {
         checksCollection.read(checkName, (err, check) => {
            // check if error occurs
            // if yes, return with 0
            if (err || !check) {
               console.log(err);
               return 0;
            };

            // validate the checks status
            if (!check.status) {
               check.status = 'down';
            };

            // validate the lastChange
            if (!check.lastChange || typeof check.lastChange !== 'number') {
               check.lastChange = null;
            };

            const requestProtocol = check.protocol === 'http' ? http : https;
            const parsedURL = url.parse(utilities.normalizeURL(check.url));

            // hostname represent the [hostname] only. (e.g. www.google.com)
            // host represents the [hostname + port]. (e.g. www.google.com:800).
            // 'pathname' represent the [pathname] only. (e.g. /users/posts)
            // 'path' represents the [pathname + query params]. (e.g. /users/post?id=1&email=omarbinsaleh44@gmail.com);

            // construct the request option
            const requestOptions = {
               protocol: parsedURL.protocol,
               hostname: parsedURL.hostname,
               method: check.method.toUpperCase(),
               path: parsedURL.path,
               timeout: check.timeoutSeconds * 1000
            };

            // track if the outcome has been sent to the next process
            let isOutcomeSent = false;

            // perform request for the checks
            const req = requestProtocol.request(requestOptions, (res) => {

               // define the outcome
               const outcome = {
                  statusCode: res.statusCode,
                  error: false,
                  value: null,
               }

               // check if the outcome is sent to the next process
               // if not, process the outcome
               if (!isOutcomeSent) {
                  processOutcome(check, outcome);
                  isOutcomeSent = true;
               };

               return 1;
            });

            req.on('error', (err) => {
               // define the outcome
               const outcome = {
                  statusCode: null,
                  error: true,
                  value: err
               };

               // check if the outcome is sent to the next process
               // if not, process the outcome
               if (!isOutcomeSent) {
                  processOutcome(check, outcome);
                  isOutcomeSent = true;
               }

               // abort the request
               req.destroy(err);

            });

            req.on('timeout', () => {
               // define the outcome
               const outcome = {
                  statusCode: null,
                  error: true,
                  value: 'timeout'
               }

               // check if the outcome is sent to the next process
               // if not, process the outcome
               if (!isOutcomeSent) {
                  processOutcome(check, outcome);
                  isOutcomeSent = true;
               }

               // abort the request explicitly
               req.destroy(new Error('Request Timeout'));
            })

            // send the request and end
            // and return from this function
            return req.end();
         });
      });
   });
};

// @name       : processOutcome
// @description: A helper function to process the request outcome and save the new check data to the database
// @auth       : Omar Bin Saleh
// @contact    : omarbinsaleh44@gmail.com
const processOutcome = (check, outcome) => {
   const newCheck = { ...check };

   // determine the 'Up' or 'Down' status of the check url
   if (!outcome.error && outcome.statusCode && check.successCodes.includes(outcome.statusCode)) {
      newCheck.status = 'up';
      newCheck.lastChange = Date.now();
   } else {
      newCheck.status = 'down';
      newCheck.lastChange = Date.now();
   };

   // save the new check data
   checksCollection.update(check._id, newCheck, (err, updatedCheck) => {
      // handle the error 
      // if error occurs, log the error and return from this function 
      if (err || !updatedCheck) {
         console.log(err);
         return 0;
      };

      // check if the the 'Up' or 'Down' status has changed
      // if yes, notify the user by SMS
      if (check.lastChange && check.status !== updatedCheck.status) {
         const message = `Alert: You check for ${updatedCheck.method.toUpperCase()} ${updatedCheck.url} is currently ${updatedCheck.status}`;
         utilities.notification.sendMessage(Number(check.userPhone), message); // send notification
      };

      // return from this function
      return 1;
   })

   // return from the processOutcome function
   return 1;
}



// export the services module
module.exports = services;