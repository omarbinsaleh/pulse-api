# requestResponseHandler.js Documentation

This module provides the main request and response handler for the PulseAPI project. It acts as the central middleware for processing all incoming HTTP requests, parsing relevant data, validating routes and methods, and sending responses in a consistent format.

---

## File Location

```
helpers/
└── requestResponseHandler.js
```

---

## What It Does

- Adds helper methods (`send` and `status`) to the response object for standardized JSON responses.
- Parses cookies from the request and attaches them to `req.cookies`.
- Parses the request URL and query parameters, attaching them to the request object.
- Validates the HTTP method against allowed methods (`GET`, `POST`, `PUT`, `DELETE`).
- Matches the request to a defined route and validates its existence.
- Collects and parses incoming request data (body).
- Invokes the appropriate route handler with the processed request and response objects.

---

## Step-by-Step Implementation Details

### 1. Add Helper Methods to Response

- **`res.send(statusCode, payload)`**  
  - Sets the response status code and content type.
  - Serializes the payload to JSON.
  - Ends the response with the payload.

- **`res.status(statusCode).json(payload)`**  
  - Sets the response status code and content type.
  - Serializes the payload to JSON.
  - Ends the response with the payload.

### 2. Parse Cookies

- Uses the custom `myCookieParser` middleware.
- Extracts cookies from the request headers.
- Attaches the parsed cookies as an object to `req.cookies`.

### 3. Parse URL and Query Parameters

- Uses Node.js's `url.parse` to parse the request URL.
- Attaches the parsed URL object to `req.url`.
- Extracts query parameters and attaches them to `req.query`.

### 4. Validate HTTP Method

- Checks if the request method is one of the allowed methods.
- If not, responds with a 400 status and error message.

### 5. Match and Validate Route

- Trims and normalizes the request path.
- Searches for a matching route in the `routes` array based on method and path.
- If no route is found, responds with a 404 status and error message.

### 6. Collect and Parse Incoming Data

- Uses `StringDecoder` to collect incoming data chunks from the request.
- On the `end` event, finalizes the data and parses it as JSON using the utility function.
- Attaches the parsed body to `req.body`.

### 7. Invoke Route Handler

- Calls the matched route's handler function, passing in the processed `req` and `res` objects.

---

## Example Usage

This module is typically used as the main handler for the Node.js HTTP server:

```javascript
const http = require('http');
const requestResponseHandler = require('./helpers/requestResponseHandler');

const server = http.createServer(requestResponseHandler);

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## Notes

- All responses are sent in JSON format for consistency.
- The module is designed to be extensible and modular.
- It centralizes request parsing, validation, and routing logic for maintainability.

---