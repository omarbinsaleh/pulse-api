// Module Dependencies
const url = require('url');
const routes = require('../routes/routes.js');
const { StringDecoder } = require('string_decoder');

// @name: requestResponseHanlder
// @desc: A function to handle all the requests and responses
// @auth: Omar Bin Saleh
const requestResponsehandler = (req, res) => {
   // add a send function in the response object
   res.send = (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload = typeof payload === 'object' ? JSON.stringify(payload) : {};
      
      res.writeHead(statusCode);
      res.end(payload);
   }
   
   // add a status method in the response object
   res.status = (statusCode) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      
      res.writeHead(statusCode);
      return {
         json(payload) {
            payload = typeof payload === 'object' ? JSON.stringify(payload) : {};
            res.end(payload);
         }
      };
   };
   
   // parse the req.url
   const parsedUrl = url.parse(req.url, true);
   const headers = req.headers;
   req.url = parsedUrl;

   // identify the routes
   const pathName = parsedUrl.pathname.replace(/^[\s\/]+|[\s\/]+$/g, '');
   const method = req.method;
   const route = routes.find(r => method === r.method && pathName === (r.path === "/" ? "" : r.path));
   if (!route) {
      return res.end('Route Not Found');
   };

   // process the incoming data
   const decoder = new StringDecoder();
   let incomingData = '';


   // add data event listener
   req.on('data', (buffer) => {
      incomingData += decoder.write(buffer);
   });

   // add on end event listener
   req.on('end', () => {
      incomingData += decoder.end();

      // return the right handler
      route.handler(req, res);
   });
};

// Export the Module
module.exports = requestResponsehandler;