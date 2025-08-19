# PULSE-API - An Uptime/Downtime Monitoring API

PulseAPI is a backend service designed and built with raw Node.js to monitor the uptime and downtime of websites and APIs. It provides developers and businesses with real-time insights into service availability, helping ensure reliability and quick response to outages. The implementation details of the API is as follows:

## Start the API Server

Create a fine named `index.js` in the root and set the `index.js` as the main entry point. In the `index.js` file import all the dependencies required to create a http server.

```jsx
// Server Dependencies
const http = require('http');
const requestResponseHandler = require('./helpers/requestResponseHandler.js');
const port = process.env.PORT || 3000;

// Create http Server
const server = http.createServer(requestResponseHandler);

// Listen the Server
server.listen(port, () => {
   console.log(`Server is runing on: http://localhost:${port}`):
})
```

Implement the `requestResposeHandler` function in the `./helpers/requestResponseHandler.js` file. This `requestResponseHandler` will handle all the requests and responses.

Define all the api end points in the `./routes/routes.js` file.

Define all the controllers required for the routes in the `./controllers/` directory

### **The Implementation of the `requestResponseHandler` Function**

The function is implemented in the `./helpers/requestResponseHandler.js` file where all the necessary dependencies are imported first then the handler function is defined and finally the handler function is exported to the outer file. The `requestResponseHandler` does the following things:

- add a `res.send(statusCode, payload)` method in the response object
- add a `res.status(statusCode).json(payload)` mehtod in the response object
- parse the `req.url` using the `url.parse(urlStr, true)` method provided by the node's built-in `url` module.
- indentify the requested route from all the registered routes defined in the `./routes/routes.js` file and save the route in a variable named `route`, if the route is found.
- If the requested routes is not found among the registered routes defined in the `./routes/routes.js` file, then call the `res.writeHead(404)` to set 404 status code and the `res.end(messageStr)` end the response with a message saying 'Route Not Found`.
- process the incoming data by adding a `data` event listener on the `req` object.
- listen for the `end` event on the `req` object and as soon as the `end` event is fired, call the `route.handler` function associated with requested route.

Here is how the `requestResponseHandler` function defination looks like in the `./helpers/requestResponseHandler.js` file

```jsx
// Module Dependencies
const url = require("url");
const routes = require("../routes/routes.js");
const { StringDecoder } = require("string_decoder");

// @name: requestResponseHanlder
// @desc: A function to handle all the requests and responses
// @auth: Omar Bin Saleh
const requestResponsehandler = (req, res) => {
  // add a send function in the response object
  res.send = (statusCode, payload) => {
    statusCode = typeof statusCode === "number" ? statusCode : 500;
    payload = typeof payload === "object" ? JSON.stringify(payload) : {};

    res.writeHead(statusCode);
    res.end(payload);
  };

  // add a status method in the response object
  res.status = (statusCode) => {
    statusCode = typeof statusCode === "number" ? statusCode : 500;

    res.writeHead(statusCode);
    return {
      json(payload) {
        payload = typeof payload === "object" ? JSON.stringify(payload) : {};
        res.end(payload);
      },
    };
  };

  // parse the req.url
  const parsedUrl = url.parse(req.url, true);
  const headers = req.headers;
  req.url = parsedUrl;

  // identify the routes
  const pathName = parsedUrl.pathname.replace(/^[\s\/]+|[\s\/]+$/g, "");
  const method = req.method;
  const route = routes.find(
    (r) => method === r.method && pathName === (r.path === "/" ? "" : r.path)
  );
  if (!route) {
    return res.end("Route Not Found");
  }

  // process the incoming data
  const decoder = new StringDecoder();
  let incomingData = "";

  // add data event listener
  req.on("data", (buffer) => {
    incomingData += decoder.write(buffer);
  });

  // add on end event listener
  req.on("end", () => {
    incomingData += decoder.end();

    // return the right handler
    route.handler(req, res);
  });
};

// Export the Module
module.exports = requestResponsehandler;
```

### **The Implementation of Routes or API End Point**

Register Your allowed API end points in the `./routes/routes.js` file

```jsx
// Import Controllers:
const serverControllers = require("../controllers/serverControllers.js");

// Register Routes here
const routes = [
  { path: "/", method: "GET", handler: serverControllers.greetUser },
];

// Exports the routes
module.exports = routes;
```

## Create, Read, Update and Delete User

### **Implementation of the `create` Function**

The `create` method is dfined to create a new file and write data into that file. The following is the implementation details of the `create` method exposed from the `./lib/data.js` file.

```jsx
// Import Dependencies
const fs = require("fs");
const path = require("path");

// Module Scaffolding
const lib = {};

// @name: create
// @desc: Create a new file and write content or data into that new file
// @auth: Omar Bin Saleh
lib.create = (dir, file, data, cb) => {
  cb = typeof cb === "function" ? cb : (err) => {};
  if (!dir) return cb("Error: Please specify a directory name");
  if (!data) return cb("Error: Data can be empty");

  // open the file
  const pathName = path.join(__dirname, "../.data", dir, file + ".json");
  fs.open(pathName, "wx", (err, fileDescriptor) => {
    // perform error validation
    if (err || !fileDescriptor) {
      return cb("Error: Could not create a new file, it may already exist!");
    }

    // write data into the file
    fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
      // perform error validation
      if (err) {
        return cb("Error happened while writing data into the file");
      }

      // close the file
      fs.close(fileDescriptor, (err) => {
        // perform error validation
        if (err) {
          return cb("Error happened while closing the file");
        }

        // return by calling the callback
        return cb(false);
      });
    });
  });
};

// export the lib
module.exports = lib;
```

### **Implementation of the ` read ` Function**

The ` read ` method is designed to read the content of a particular ` .json ` file. using the `fs.readFile(path, options, callback)` method. The following is the implementation details of the ` read ` method exposed from the ` ./lib/data.js ` file

```jsx
// Import Dependencies
const fs = require('fs');
const path = require('path');

// Module Scaffolding
const lib = {};

// @name: read
// @desc: read a particular `.json` file's content.
// @auth: Omar Bin Saleh
lib.read = (dir, file, cb) => {
  // perform error validation
  cb = typeof cb === 'function' ? cb : (err) => {console.log(err)};
  if (!dir || !file) return cb("Directory name and the file name can not be empty");

  // read the file
  const pahtName = path.join(__dirname, '../.data', dir, file + '.json');
  fs.readFile(pathName, 'utf-8', (err, data) => {
    // perform error validation
    if (err && !data) return cb(err, data);

    // on successful operation
    return cb(err, data);
  });
};

// export the lib module
module.exports = lib;
```

### **Implementation of the ` update ` Function**

The ` update ` is a custom method defined to update the content of a particular JSON file. The followings are the implementation details of the ` update ` method exposed from the ` ./lib/data.js ` file:

```jsx
// Import Dependencies
const fs = require('fs');
const path = require('path');

// Module Scaffolding
const lib = {};

// @name: update
// @desc: update the content of an existing JSON file
// @auth: Omar Bin Saleh
lib.update = (dir, file, data, cb) => {
  cb = typeof cb === 'function' ? cb : (err) => return console.log(err);
  if (!dir || !file) return cb('Error: direcotry name and the file name can not be empty');
  if (!data) return cb('Error: please provide data');

  // step 1: open the file to update the content
  const pathName = path.join(__dirname, '../.data', dir, file + '.json');
  fs.open(pathName, 'r+', (err, fileDescriptor) => {
    // perform error validation
    if (err) return cb('Error: could not open the file for update');

    // step 2: truncate the file
    fs.ftruncate(fileDescriptor, (err) => {
      // perform error validation
      if (err) return cb('Error: could not truncate the file');

      // step 3: write or update the file's content
      fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
        // perform error validation
        if (err) return cb('Error: could not update the file content');

        // step 4: close the file
        fs.close(flieDescriptor, (err) => {
          // perform error validation
          if (err) return cb('Error: could not close the file');

          // return from this by calling the callback with error equal to false,
          return cb(false);
        });
      });
    });
  });
};

// export the lib module
module.exports = lib;
```

## Implementation of Token Based Authentication

## Implementation of the Logout Mechanism

## Setting Links and Uptime/Downtime

## Create, Read, Update and Delete Links & Implement Rate Limit

## Check Up/Down Time
