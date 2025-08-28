# Utilities Module Documentation

This folder contains utility modules used throughout the PulseAPI project for common tasks such as hashing, JSON parsing, and utility aggregation.

## Folder Structure

```
utilities/
├── generatehash.js   # Utility for generating hashed strings
├── parsejson.js      # Utility for safely parsing JSON
└── index.js          # Aggregates and exports all utilities
```

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
const generateHash = require('./utilities/generatehash');
const password = 'MySecretPassword!';
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
const parseJSON = require('./utilities/parsejson');
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
const utils = require('./utilities');
const hash = utils.generateHash('password');
const obj = utils.parseJSON('{"valid":true}');
```

---

## How to Use

Import the desired utility directly or use the aggregated `index.js`:

```javascript
const { generateHash, parseJSON } = require('./utilities');
```

---

## Notes

- These utilities are designed to be lightweight and reusable.
- They help keep the codebase DRY and maintainable.
- All functions are synchronous for simplicity.