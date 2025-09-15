# Utilities — Detailed Implementation & Documentation

This README documents three utility modules in the project: `generatehash.js`, `normalizeURL.js`, `notification.js`, `parsejson.js`, `validateProtocol.js`.

For each module this file covers:

- What it is (purpose)
- What it does (behavior / inputs / outputs)
- How it is implemented (step-by-step flow)
- Usage examples
- Edge-cases, caveats and recommended improvements

## Folder Structure

```
utilities/
├── generatehash.js        # Utility for generating hashed strings
├── normalizeURL.js        # Utility for returning a normalized version of an url
├── notification.js        # Utility for sending SMS notification to a user's phone number
├── parsejson.js           # Utility for safely parsing JSON
├── validateProtocol.js    # Utility for returning valid protocol for an URL
└── index.js               # Aggregates and exports all utilities
```

---

## 1. `generatehash.js`

### What it is

A small utility that generates a HMAC-SHA256 hash for a given string payload using a secret key. Intended for hashing passwords, tokens, or other sensitive strings.

### What it does

- Accepts a `payload` string and a `secret` string.
- Returns a HEX digest string produced by `crypto.createHmac('sha256', secret).update(payload).digest('hex')`.
- Throws errors on invalid input.

### Public API

```js
// CommonJS
const generateHash = require("./utils/generatehash");

const hashed = generateHash("my-password", process.env.SECRET_KEY);
```

**Return:** `string` — hex representation of the HMAC.

### Step-by-step implementation

1. Validate inputs: both `payload` and `secret` must be provided and be strings.
2. Call `crypto.createHmac('sha256', secret)` to create a HMAC instance.
3. Call `.update(payload)` on the HMAC instance to feed the payload.
4. Call `.digest('hex')` to get the resulting hex string.
5. Return the hash.
6. Any thrown errors are caught and re-thrown (wrapped) by the function.

### Example

```js
const generateHash = require("./utils/generatehash");

const hash = generateHash("superSecret", "myTopSecretKey");
console.log(hash); // e.g. '9a1f...'
```

### Edge cases & caveats

- The module currently throws `new Error('IntutError: payload and the secret must be a string')` when inputs are invalid; consider using clearer error messages and consistent error types.
- The argument name `secrete` (in code) is likely a typo — prefer `secret` for clarity.
- The module imports `../env/environment.js` but does not use it — remove unused requires or use the env secret consistently.
- The current error wrapping `throw new Error(error);` will convert any error into an `Error` whose message is the `Error` object coerced to string — prefer `throw error` or `throw new Error(error.message)` depending on the intended behavior.

### Recommended improvements

- Validate that `secret` is not an empty string and that `payload` is not empty.
- Consider returning `null` rather than throwing if you want the caller to handle failures gracefully.
- If used for passwords, combine this with a salt and a slow algorithm (e.g., bcrypt) rather than HMAC alone depending on threat model.
- Add unit tests that cover invalid inputs, expected outputs for known pairs, and non-string inputs.

---

## 2. `normalizeURL.js`

### What it is

A utility that normalizes user-provided URL-like input into a canonical absolute URL string (i.e., always returns an href like `http://example.com/`). It accepts strings like `google.com`, `www.google.com`, or full URLs and returns a proper absolute URL.

### What it does

- Validates input type.
- Optionally accepts a default protocol (default `'http'`).
- If the input already starts with `http://` or `https://`, uses it directly and returns the parsed `href`.
- Otherwise, prepends the protocol and returns the parsed `href`.

### Public API

```js
const normalizeURL = require("./utils/normalizeURL");

console.log(normalizeURL("google.com")); // 'http://google.com/'
console.log(normalizeURL("https://example.org")); // 'https://example.org/'
console.log(normalizeURL("www.google.com", "https")); // 'https://www.google.com/'
```

### Step-by-step implementation

1. Validate that `inputUrl` is a string and meets a minimal length requirement.
2. Validate that `protocol` is either `'http'` or `'https'`.
3. If `inputUrl` starts with `http://` or `https://`, construct `new URL(inputUrl)` and return its `.href`.
4. Otherwise, construct `new URL(`\${protocol}://\${inputUrl}`)` and return `.href`.
5. The function pro-actively wraps parsing with `try/catch` and attempts to fall back to constructing the URL with the provided `protocol`.

### Example

```js
const normalizeURL = require("./utils/normalizeURL");
console.log(normalizeURL("google.com"));
// => 'http://google.com/'

console.log(normalizeURL("https://sub.domain.com/path?x=1"));
// => 'https://sub.domain.com/path?x=1'
```

### Edge cases & caveats

- The code contains a few small issues:

  - A length check compares `inputUrl.length < 'hppt://'.length` — `'hppt://'` is a typo. Relying on length for URL validation is brittle.
  - When `new URL(inputUrl)` fails the catch block reconstructs `new URL(`\${protocol}://\${inputUrl}`)` — this is a reasonable fallback but it will treat invalid hostnames the same way (and may still throw for invalid inputs).

- The function does not currently validate characters in the hostname, or ensure the provided host is a valid domain — it simply relies on the WHATWG `URL` parser semantics.
- It does not normalize trailing slashes, `www` differences, or punycode conversion.

### Recommended improvements

- Fix the typo and remove the length-based guard; instead trim and test for empty strings.
- Normalize input by trimming and lower-casing the host portion where appropriate.
- Optionally add validation for hostnames (regex or use `dns` module to resolve) if you must ensure the domain exists.
- Consider exposing options (e.g., force `https`, strip path/query, remove `www`)
- Add unit tests for:

  - Pure hostnames (`google.com`, `www.google.com`)
  - Full URLs (`http://…`, `https://…`)
  - Invalid inputs (empty string, malformed strings)

---

## 3. `notification.js`

### What it is

A very small notification helper that (currently) simulates sending an SMS by validating a numeric phone number and logging a message to the console.

### What it does

- Exposes an object `notification` with a single method `sendMessage(number, message)`.
- Validates that `number` is a `number` and that its string length equals `10`.
- If valid, logs: `${message} has been sent to this number ${number}` and returns the `console.log` return value.

### Public API

```js
const notification = require("./utils/notification");

notification.sendMessage(1712345678, "Hello world");
// -> logs: "Hello world has been sent to this number 1712345678"
```

### Step-by-step implementation

1. Check if `typeof number === 'number'` and `String(number).length === 10`.
2. If validation passes, call `console.log()` with the formatted message and return.
3. If validation fails, silently return `undefined`.
4. Any runtime error is caught and logged.

### Edge cases & caveats

- It expects a `number` type; many phone numbers are passed as strings (with leading zeros or country codes). This validation will reject them.
- The length check assumes a 10-digit phone number without country code — not universal.
- The method currently _simulates_ sending by `console.log` — it doesn't integrate with a real SMS gateway.
- `console.log` return value is `undefined` — returning it is not meaningful; better to return a boolean or a Promise.

### Recommended improvements

- Accept numbers or numeric strings: normalize input by stripping spaces, `+`, hyphens.
- Accept international formats (E.164) or allow an optional `countryCode` argument.
- Make `sendMessage` asynchronous and integrate with a provider (Twilio, Nexmo, AWS SNS, etc.). Return a Promise that resolves/rejects based on provider response.
- Provide meaningful return values (`true`/`false` or a structured object) instead of logging only.
- Add unit tests and input validation tests.

---

## Common suggestions across utilities

- Add unit tests (Jest/Mocha) and CI checks.
- Use consistent error handling (throw vs return `null`/error objects).
- Add JSDoc comments above each exported function describing inputs / outputs and thrown errors.
- Add TypeScript type definitions or `@typedef` JSDoc if you intend to keep the code in plain JS.

---

## Quick Integration Examples

### Requiring all utilities

```js
const generateHash = require("./utils/generatehash");
const normalizeURL = require("./utils/normalizeURL");
const notification = require("./utils/notification");

const safeUrl = normalizeURL("google.com");
const hash = generateHash("password123", process.env.SECRET);
notification.sendMessage(1712345678, `Your hash is ${hash}`);
```

---

## Next steps (if you want me to continue)

- Add unit tests for all three modules.
- Fix the small bugs/typos in the source files and produce a PR patch.
- Convert functions to async/promises where external integrations are added (e.g., notifications).

---

## 4. `parsejson.js`

### What it is

A safe JSON parsing utility that ensures the application does not crash if given invalid JSON input. It always returns either a parsed object or an empty object.

### What it does

* Accepts a string input and an options object (optional).
* Returns a JavaScript object if parsing succeeds.
* Returns an empty object `{}` if parsing fails.

### Public API

```js
const parseJSON = require("./utils/parsejson");

const obj = parseJSON('{"name":"Omar"}'); // { name: 'Omar' }
const fallback = parseJSON("invalid-json"); // {}
```

### Step-by-step implementation

1. Validate that the input is a non-empty string.
2. Attempt `JSON.parse(data)`.
3. If successful, return the resulting object.
4. If parsing throws, return `{}` instead.

### Example

```js
const parseJSON = require("./utils/parsejson");

console.log(parseJSON('{"id":1,"title":"Hello"}'));
// { id: 1, title: 'Hello' }

console.log(parseJSON("{id:1}"));
// {}

console.log(parseJSON({id: 1, title: 'hello world'})) ;
// {id: 1, title: 'hello world'}
```

---

## 5. `validateProtocol.js`

### What it is

A small helper that ensures only supported protocols (`http` and `https`) are considered valid.

### What it does

* Accepts a string `protocol`.
* Returns the protocol if valid.
* Returns `0` (falsy) if invalid or not a string.

### Public API

```js
const validateProtocol = require("./utils/validateProtocol");

console.log(validateProtocol("http"));  // 'http'
console.log(validateProtocol("https")); // 'https'
console.log(validateProtocol("ftp"));   // 0
```

### Step-by-step implementation

1. Define the whitelist of valid protocols: `["http", "https"]`.
2. Check that input is a string — if not, return `0`.
3. Check if the input is in the whitelist — if not, return `0`.
4. If valid, return the protocol string.

### Example

```js
const validateProtocol = require("./utils/validateProtocol");

console.log(validateProtocol("http"));
// 'http'

console.log(validateProtocol("ftp"));
// 0
```

### Edge cases & caveats

* Returns `0` instead of `false` or `null`, which can be confusing.
* Only supports lowercase `http` and `https`. Uppercase (`HTTP`) will fail.
* No flexibility to extend protocols without editing the code.

### Recommended improvements

* Return `false` or `null` instead of `0` for clarity.
* Normalize input by trimming and lowercasing before validation.
* Allow passing a custom whitelist of protocols.
* Add unit tests for valid, invalid, and edge cases.

---

## Common suggestions across utilities

* Add unit tests (Jest/Mocha).
* Use consistent return types for errors (throw vs fallback).
* Add JSDoc comments above each exported function.
* Add TypeScript type definitions if planning for long-term use.

---

## Quick Integration Examples

```js
const parseJSON = require("./utils/parsejson");
const validateProtocol = require("./utils/validateProtocol");

const data = '{"id":123}';
const obj = parseJSON(data);

const protocol = validateProtocol("https");

console.log(obj, protocol);
```

---

*Documentation updated: added detailed implementation for `parsejson.js` and `validateProtocol.js`.*














_Documentation generated: detailed utilities implementation._

---

## `generatehash.js`

### Purpose

Generates a secure hash from a given string, typically used for password hashing.

### Implementation Details (Step-by-Step)

1. **Import crypto module:**  
   Uses Node.js's built-in `crypto` module for hashing.
2. **Create hash object:**  
   Initializes a hash object with a chosen algorithm (e.g., SHA256).
3. **Update hash with input:**  
   Feeds the input string (e.g., password) into the hash object.
4. **Digest hash:**  
   Finalizes the hash and outputs it in hexadecimal format.
5. **Return hash:**  
   Returns the resulting hash string.

#### Example Usage

```javascript
const generateHash = require("./utilities/generatehash");
const password = "MySecretPassword!";
const hashed = generateHash(password);
// hashed is a securely hashed string
```

---

## `parsejson.js`

### Purpose

Safely parses a JSON string and prevents the application from crashing due to malformed JSON.

### Implementation Details (Step-by-Step)

1. **Receive JSON string:**  
   Accepts a string input to be parsed.
2. **Try parsing:**  
   Attempts to parse the string using `JSON.parse`.
3. **Catch errors:**  
   If parsing fails, catches the error.
4. **Return result:**  
   Returns the parsed object if successful, or an empty object/false if parsing fails.

#### Example Usage

```javascript
const parseJSON = require("./utilities/parsejson");
const jsonString = '{"name":"Omar"}';
const obj = parseJSON(jsonString);
// obj = { name: 'Omar' }

const badString = '{name:"Omar"}';
const result = parseJSON(badString);
// result = {} or false (depending on implementation)
```

---

## `index.js`

### Purpose

Centralizes and exports all utility functions for easy import elsewhere in the project.

### Implementation Details (Step-by-Step)

1. **Import utility modules:**  
   Imports `generatehash.js` and `parsejson.js`.
2. **Aggregate utilities:**  
   Combines them into a single object.
3. **Export utilities:**  
   Exports the object so other modules can access all utilities from one place.

#### Example Usage

```javascript
const utils = require("./utilities");
const hash = utils.generateHash("password");
const obj = utils.parseJSON('{"valid":true}');
```

---

## How to Use

Import the desired utility directly or use the aggregated `index.js`:

```javascript
const { generateHash, parseJSON } = require("./utilities");
```

---

## Notes

- These utilities are designed to be lightweight and reusable.
- They help keep the codebase DRY and maintainable.
- All functions are synchronous for simplicity.
