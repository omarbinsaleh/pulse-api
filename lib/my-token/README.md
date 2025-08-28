# My-Token Library Documentation

The `my-token` library is a lightweight, custom implementation for creating and verifying tokens in Node.js. It is used in the PulseAPI project to handle authentication tokens similar to JWT (JSON Web Token).

## File Structure

```
lib/
└── my-token/
    └── mytoken.js   # Main module for token operations
```

## Usage

### Importing

```javascript
const myToken = require('./lib/my-token/mytoken');
```

### Signing a Token

Creates a token from a payload and a secret.

```javascript
const payload = { userId: '123', email: 'user@example.com' };
const secret = 'your-secret-key';

const token = myToken.sign(payload, secret, { expiresIn: '1h' });
// token is a string
```

### Verifying a Token (Callback-based)

Verifies the token and returns the payload if valid via a callback.

```javascript
myToken.verify(token, secret, (err, decoded) => {
  if (err) {
    // handle error (err.name can be 'InvalidTokenError', 'InvalidSignatureError', or 'TokenExpiredError')
  } else {
    // decoded contains the original payload
  }
});
```

## API Reference

### `sign(payload, secret, options)`

- **payload**: Object to encode in the token.
- **secret**: String used to sign the token.
- **options**: Optional object, e.g. `{ expiresIn: '1h' }` (default is 1 hour).
- **returns**: String (the token).

### `verify(token, secret, callback)`

- **token**: String token to verify.
- **secret**: String used to verify the token.
- **callback**: Function `(err, payload)` called with error or decoded payload.
- **errors**:  
  - `InvalidTokenError`: Token is missing or not a string, or format is invalid  
  - `InvalidSignatureError`: Signature does not match  
  - `TokenExpiredError`: Token has expired

## Notes

- The library does not implement all JWT features, but provides basic signing and verification.
- Tokens are used for authentication and are stored in HTTP-only cookies in PulseAPI.
- Always keep your secret key safe and never