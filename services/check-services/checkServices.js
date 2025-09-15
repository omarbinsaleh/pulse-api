// Module Dependecies
const http = require('http');
const https = require('https');
const url = require('url');
const checksCollection = require('../../collections/checksCollection.js');
const utilities = require('../../utilities');

// Moduel Scaffolding
const checkServices = {
   isFirstRound: true
};

/**
 * @name monitorChecksUrl
 * @description Monitors all registered checks URLs for status changes (up or down) and
 * processes their outcomes. This function performs the following tasks:
 * 
 * 1. Retrieves the list of all check names from `checksCollection`.
 * 2. Validates that the list is a proper array.
 * 3. Reads each check’s configuration (protocol, URL, method, timeout, etc.).
 * 4. Sends an HTTP/HTTPS request to the check URL and measures its response.
 * 5. Tracks and processes the outcome (status code, errors, timeout) using `processOutcome`.
 * 6. Updates check status to 'up' or 'down' based on the response.
 * 
 * This function ensures that each check is processed exactly once per request, even if errors
 * or timeouts occur.
 * 
 * @access Private (internal monitoring function)
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 * @example
 * // Start monitoring checks
 * checkServices.monitorChecksUrl();
 * 
 * @returns {void} Does not return any value; outcomes are handled internally.
 */
checkServices.monitorChecksUrl = () => {
   console.log('Monitoring the checks urls for status changes....')

   // list out all the checks
   checksCollection.listDocsNames((err, docsNames) => {
      // handle the error occured while listing documents names
      if (err) {
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
      checksNames.forEach((checkName, index) => {
         checksCollection.read(checkName, (err, check) => {
            // check if error occurs
            // if yes, return with 0
            if (err) {
               console.error(err);
               return 0;
            };

            // validate the checks status
            // if nothing found, mark 'down' as default
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
               protocol: parsedURL.protocol, // (e.g. 'http:' or 'https:');
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
               };

               // check if the outcome is sent to the next process
               // if not, process the outcome
               if (!isOutcomeSent) {
                  checkServices.processOutcome(check, outcome);
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
               return req.destroy(err);
            });

            req.on('timeout', () => {
               // define the outcome
               const outcome = {
                  statusCode: null,
                  error: true,
                  value: 'timeout'
               };

               // check if the outcome is sent to the next process
               // if not, process the outcome
               if (!isOutcomeSent) {
                  processOutcome(check, outcome);
                  isOutcomeSent = true;
               };

               // abort the request explicitly
               return req.destroy(new Error('Request Timeout'));
            });

            // send the request and end
            // and return from this function
            return req.end();
         });
      });
   });
};

/**
 * @name processOutcome
 * @description Processes the result of a URL check and updates the check’s status.
 * 
 * Steps performed by this function:
 * 1. Determines whether the check is 'up' or 'down' based on the outcome:
 *    - If there is no error and the response status code is in `check.successCodes`, status is 'up'.
 *    - Otherwise, status is set to 'down'.
 * 2. Updates the `lastChange` timestamp to the current time.
 * 3. Saves the updated check data to the database using `checksCollection.update`.
 * 4. If the status has changed since the last check, notifies the user via SMS using 
 *    `utilities.notification.sendMessage`.
 * 
 * @param {Object} check - The check object containing the URL, method, expected success codes, 
 *                         last status, user info, etc.
 * @param {Object} outcome - The result of the URL check containing:
 *                           - `statusCode` {Number|null} - HTTP response code
 *                           - `error` {Boolean} - Whether an error occurred
 *                           - `value` {*} - Error object or additional info
 * 
 * @returns {Number} Returns 1 on completion. Errors during database update are logged but 
 *                   do not throw exceptions.
 * 
 * @access Private (internal processing function)
 * @example
 * const outcome = { statusCode: 200, error: false, value: null };
 * checkServices.processOutcome(check, outcome);
 */

checkServices.processOutcome = (check, outcome) => {
   const newCheck = { ...check };

   // determine the 'Up' or 'Down' status of the check url
   if (!outcome.error && outcome.statusCode && check.successCodes.includes(outcome.statusCode)) {
      newCheck.status = 'up';
      newCheck.lastChange = Date.now();

      // print the result in the terminal or console
      console.log(`${outcome.statusCode}: ${check.method} ${check.url}`)
   } else {
      newCheck.status = 'down';
      newCheck.lastChange = Date.now();

      // print the result in the terminal or console
      console.log(`${outcome.statusCode}: ${check.method} ${check.url}`)
   };

   // save the new check data
   checksCollection.update(check._id, newCheck, (err, updatedCheck) => {
      // handle the error 
      // if error occurs, log the error and return from this function 
      if (err) {
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

// Export the checkServices Module
module.exports = checkServices;