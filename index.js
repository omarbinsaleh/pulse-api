// Server Dependencies
const http = require('http');
const requestResponseHandler = require('./helpers/requestResponseHandler.js');
const port = process.env.PORT || 3000;
const data = require('./lib/data.js');

// test the file system
data.update('test', 'newFile', [{name: "omar bin saleh", role: "Frontend developer"}, {name: "fatema rima", role: "react developer"}], (err) => {
   if (err) return console.log(err);

   console.log("Updated the file successfully");
})

// Create the Server
const server = http.createServer(requestResponseHandler)

// Listen the Server
server.listen(port, () => {
   console.log(`Server is runing on: http://localhost:${port}`);
})