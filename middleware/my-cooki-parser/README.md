# My-Cookie-Parser Module Documentation

The `my-cookie-parser` module is a simple middleware for parsing cookies from HTTP request headers in Node.js. It extracts cookies from the `req.headers.cookie` string and returns them as a key-value object.

## File Location

```
middleware/
└── my-cookie-parser.js
```

## Usage

### Importing

```javascript
const myCookieParser = require('./middleware/my-cookie-parser');
```

### Parsing Cookies

Pass the HTTP request object to the parser:

```javascript
const cookies = myCookieParser(req);
// cookies is an object: { token: 'abc123', session: 'xyz456' }
```

## Implementation Details

- Checks if the `cookie` header exists in the request.  
  - If not, returns an empty object.
- Splits the cookie string by `;` to get individual cookies.
- For each cookie, splits by `=` to separate the key and value.
- Trims whitespace from keys and values.
- Returns an object mapping cookie names to their values.

### Example

If the request header is:
```
cookie: token=abc123; session=xyz456
```
The returned object will be:
```javascript
{
  token: 'abc123',
  session: 'xyz456'
}
```

## Export

The module exports a single function:
```javascript
module.exports =