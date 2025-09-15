# My-DB Library Documentation

The `my-db` library is a simple file-based database module for Node.js, designed for basic CRUD operations using JSON files. It is used in the PulseAPI project to manage collections such as users, tokens, and blacklisted tokens.

## Folder Structure

```
lib/
└── my-db/
    ├── collection.js   # Defines the Collection class for CRUD operations
    ├── db.js           # Handles database folder creation and initialization
    └── index.js        # Entry point for the my-db library
```

## Usage

### Initialization

To use the library, require it in your code:

```javascript
const createDB = require("./lib/my-db");
```

### Creating a Collection

```javascript
const myDB = createDB('pulseDB');
const users = myDB.createCollection("users");
```

### CRUD Operations

#### Create a Document

```javascript
users.create(
  "user-id",
  { name: "John Doe", email: "john@example.com" },
  (err, doc) => {
    if (err) {
      // handle error
    } else {
      // doc contains the created document
    }
  }
);
```

#### Read a Document

```javascript
users.read("user-id", (err, doc) => {
  if (err) {
    // handle error
  } else {
    // doc contains the user data
  }
});
```

#### Update a Document

```javascript
users.update("user-id", { name: "Jane Doe" }, (err, doc) => {
  if (err) {
    // handle error
  } else {
    // doc contains the updated document
  }
});
```

#### Delete a Document

```javascript
users.delete("user-id", (err, success) => {
  if (err) {
    // handle error
  } else {
    // success is true if deleted
  }
});
```

## API Reference

### Collection Class

- **create(id, doc, callback)**  
  Creates a new document with the given `id` and data.

- **read(id, callback)**  
  Reads a document by `id`.

- **update(id, doc, callback)**  
  Updates an existing document by `id`.

- **delete(id, callback)**  
  Deletes a document by `id`.

### myDB Methods

- **createDB(name)**  
  Initializes the database folder.
  Return `createCollection` method

- **createCollection(name)**  
  Returns a new `Collection` instance for the given collection name.

## Notes

- All data is stored as JSON files in the `db` folder.
- Each collection is a subfolder, and each document is a `.json` file named by its ID.
- Operations are asynchronous and use Node.js-style callbacks.

---
