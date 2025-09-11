// Module Dependencies
const url = require('url');
const routes = require('../routes/routes.js');
const { StringDecoder } = require('string_decoder');
const utilities = require('../utilities');
const myCookieParser = require('../middleware/my-cooki-parser/my-cookie-parser.js');

// @name: requestResponseHanlder
// @desc: A function to handle all the requests and responses
// @auth: Omar Bin Saleh
const requestResponsehandler = (req, res) => {
   // add a send function in the response object
   res.send = (statusCode, payload) => {
      // validate the status code and payload
      // make sure they are in the right formate
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload = typeof payload === 'object' ? JSON.stringify(payload) : typeof payload === 'string' ? payload : {};

      // set the 'content-type' header
      res.setHeader('content-type', 'application/json');

      // set the status code
      res.writeHead(statusCode);

      // send the payload to the client
      res.end(payload);
   }
   
   // add a status method in the response object
   res.status = (statusCode) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      
      res.setHeader('content-type', 'application/json');
      res.writeHead(statusCode);
      return {
         json(payload) {
            payload = typeof payload === 'object' ? JSON.stringify(payload) : typeof payload === 'string' ? payload : {};
            res.end(payload);
         }
      };
   };

   // parse the http cookies and 
   // add the parsed cookies to the request object
   const cookies = myCookieParser(req);
   req.cookies = cookies;

   // parse the req.url and add the parsed url to the request object
   const parsedUrl = url.parse(req.url, true);
   const headers = req.headers;
   req.url = parsedUrl;

   // add the query parameter object to the request object
   req.query = typeof parsedUrl.query === 'object' ? parsedUrl.query : {};

   // validate allowed request method
   const allowedMethod = ['GET', 'POST', 'PUT', 'DELETE']
   const method = req.method;
   if (!allowedMethod.includes(method)) {
      return res.status(400).json({success: false, message: 'Unaccepted request method'});
   }

   // identify and validate the requested routes
   const pathName = parsedUrl.pathname.replace(/^[\s\/]+|[\s\/]+$/g, '');
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