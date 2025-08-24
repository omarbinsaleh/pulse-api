// Server Dependencies
const http = require('http');
const env = require('./env/environment.js');
const requestResponseHandler = require('./helpers/requestResponseHandler.js');
const port = env.PORT || 4000;

// Create the Server
const server = http.createServer(requestResponseHandler);

// Listen the Server
server.listen(port, () => {
   console.log(`Server is runing on: http://localhost:${port}`);
})