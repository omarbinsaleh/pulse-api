// Server Dependencies
const http = require('http');
const requestResponseHandler = require('./helpers/requestResponseHandler.js');
const port = process.env.PORT || 3000;

// Create the Server
const server = http.createServer(requestResponseHandler)

// Listen the Server
server.listen(port, () => {
   console.log(`Server is runing on: http://localhost:${port}`);
})