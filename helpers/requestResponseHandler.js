// Module Dependencies
const url = require('url');
const routes = require('../routes/routes.js');
const { StringDecoder } = require('string_decoder');
const utilities = require('./utilities.js');

// @name: requestResponseHanlder
// @desc: A function to handle all the requests and responses
// @auth: Omar Bin Saleh
const requestResponsehandler = (req, res) => {
   // add a send function in the response object
   res.send = (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload = typeof payload === 'object' ? JSON.stringify(payload) : {};
      
      res.setHeader('content-type', 'application/json');
      res.writeHead(statusCode);
      res.end(payload);
   }
   
   // add a status method in the response object
   res.status = (statusCode) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      
      res.setHeader('content-type', 'application/json');
      res.writeHead(statusCode);
      return {
         json(payload) {
            payload = typeof payload === 'object' ? JSON.stringify(payload) : {};
            res.end(payload);
         }
      };
   };
   
   // parse the req.url and add the parsed url to the request object
   const parsedUrl = url.parse(req.url, true);
   const headers = req.headers;
   req.url = parsedUrl;

   // validate allowed request method
   const allowedMethod = ['GET', 'POST', 'PUT', 'DELETE']
   const method = req.method;
   if (!allowedMethod.includes(method)) {
      return res.status(400).json({success: false, message: 'Unaccepted request method'});
   }

   // identify and validate the requested routes
   const pathName = parsedUrl.pathname.replace(/^[\s\/]+|[\s\/]+$/g, '');
   console.log(pathName)
   const route = routes.find(r => {
      return method === r.method && pathName === (r.path === "/" ? "" : r.path.replace(/^[\s\/]+|[\s\/]+$/g, ''))
   });
   if (!route) {
      return res.status(404).json({success: false, message: 'Route not found'});
   };

   // process the incoming data
   const decoder = new StringDecoder();
   let incomingData = '';

   // add data event listener to the request
   req.on('data', (buffer) => {
      incomingData += decoder.write(buffer);
   });

   // add end event listener to the request
   req.on('end', () => {
      incomingData += decoder.end();

      // add the incoming data to the request body
      req.body = utilities.parseJSON(incomingData);

      // return the right handler
      return route.handler(req, res);
   });
};

// Export the Module
module.exports = requestResponsehandler;