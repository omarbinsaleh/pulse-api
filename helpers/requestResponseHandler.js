// Module Dependencies
const url = require('url');
const routes = require('../routes/routes.js');
const { StringDecoder } = require('string_decoder');
const utilities = require('../utilities');
const myCookieParser = require('../middleware/my-cooki-parser/my-cookie-parser.js');

/**
 * @name requestResponseHandler
 * @description Core function to handle all HTTP requests and responses in the app.
 * It augments the response object with helper methods (`res.send` and `res.status`),
 * parses cookies, URL, headers, query parameters, and request body,
 * and dispatches the request to the appropriate route handler.
 * 
 * @param {import('http').IncomingMessage} req - The HTTP request object
 * @param {import('http').ServerResponse} res - The HTTP response object
 * @returns {void}
 * 
 * @example
 * const http = require('http');
 * const server = http.createServer(requestResponseHandler);
 * server.listen(3000);
 */
const requestResponsehandler = (req, res) => {
   // ----------------------------------------
   // Enhance Response Object
   // ----------------------------------------

   /**
    * @name res.send
    * @description Sends a response with the given status code and payload.
    * Automatically sets the `Content-Type` header to `application/json`.
    * 
    * @param {number} statusCode - HTTP status code
    * @param {object|string} payload - Response body (object will be JSON stringified)
    * @returns {void}
    */
   res.send = (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload =
         typeof payload === 'object'
            ? JSON.stringify(payload)
            : typeof payload === 'string'
               ? payload
               : {};

      res.setHeader('content-type', 'application/json');
      res.writeHead(statusCode);
      res.end(payload);
   };

   /**
    * Sets the HTTP status code for the response.
    * @param {number} statusCode - The HTTP status code (default: 500).
    * @returns {import('http').ServerResponse} res - Returns the response object for chaining.
    * 
    * @example
    * res.status(404).json({ message: 'Not found' });
    */
   res.status = (statusCode) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      res.statusCode = statusCode;
      return res;
   };
   
   res.json = (payload) => {
      // res.writeHead(statusCode);
      res.setHeader('content-type', 'application/json');
      payload =
         typeof payload === 'object'
            ? JSON.stringify(payload)
            : typeof payload === 'string'
               ? payload
               : {};
      return res.end(payload);
   };

   // ----------------------------------------
   // Parse Cookies and URL
   // ----------------------------------------

   // Parse cookies and attach to request
   req.cookies = myCookieParser(req);

   // Parse the request URL and query parameters
   const parsedUrl = url.parse(req.url, true);
   req.url = parsedUrl;
   req.query = typeof parsedUrl.query === 'object' ? parsedUrl.query : {};

   // ----------------------------------------
   // Match Request Method
   // ----------------------------------------

   // Validate request method
   const allowedMethod = ['GET', 'POST', 'PUT', 'DELETE'];
   const method = req.method;
   if (!allowedMethod.includes(method)) {
      return res.status(400).json({ success: false, message: 'Unaccepted request method' });
   }

   // ----------------------------------------
   // Match and Find Route
   // ----------------------------------------
   const pathName = parsedUrl.pathname.replace(/^[\s\/]+|[\s\/]+$/g, '');
   const route = routes.find((r) => {
      return (
         method === r.method &&
         pathName === (r.path === '/' ? '' : r.path.replace(/^[\s\/]+|[\s\/]+$/g, ''))
      );
   });
   if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
   }

   // Collect incoming request body
   const decoder = new StringDecoder();
   let incomingData = '';

   req.on('data', (buffer) => {
      incomingData += decoder.write(buffer);
   });

   req.on('end', () => {
      incomingData += decoder.end();
      req.body = utilities.parseJSON(incomingData);

      // Dispatch to route handler
      return route.handler(req, res);
   });
};

// Export the Module
module.exports = requestResponsehandler;
