const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const utilities = require('../../helpers/utilities.js');

class Collection {
   constructor(dbPath, name) {
      this.name = name;
      this.collectionPath = path.join(dbPath, name);

      // Ensure the collection directory exists
      fs.mkdir(this.collectionPath, { recursive: true }, (err) => {
         if (err) {
            // Handle error if directory creation fails
            throw new Error(`Could not create collection directory`);
         }

         // Directory created successfully
         return true;
      });
   }

   // generate a unique ID
   genereateUniqueId() {
     return crypto.randomUUID(); 
   }

   // create a document
   create(doc, cb) {
      // Perform error handling
      cb = typeof cb === 'function' ? cb : (err, doc) => { };
      if (!doc) {
         const error = new Error("InputError: Document data cannot be empty");
         return cb(error);
      };

      if (typeof doc !== 'object' || Array.isArray(doc)) {
         const error = new Error("InputError: Document data must be an object");
         return cb(error);
      };

      const filePath = path.join(this.collectionPath, `${doc._id}.json`);

      // Open the file in write mode, creating it if it doesn't exist
      // 'wx' flag ensures that the file is created and fails if it already exists
      fs.open(filePath, 'wx', (err, fileDescriptor) => {
         // Perform error validation
         if (err || !fileDescriptor) {
            const error = new Error('Could not create new document: Document may already exist or collection not found!');
            return cb(error);
         }

         // Write data to the file
         fs.writeFile(fileDescriptor, JSON.stringify(doc), (err) => {
            // Perform error validation
            if (err) {
               const error = new Error('Error occured while writing to new document');
               return cb(error);
            };

            // Close the file
            fs.close(fileDescriptor, (err) => {
               // Perform error validation
               if (err) {
                  const error = new Error('Error occured while closing the document file');
                  return cb(error);
               }

               // Return by calling the callback
               return cb(null, doc);
            });
         });
      });

   }

   // read a document
   read(docId, cb) {
      // Perform error handling
      cb = typeof cb === 'function' ? cb : (err, doc) => { };
      if (!docId || typeof docId !== 'string') {
         const error = new Error('InputError: Document ID must be a string and not empty');
         return cb(error);
      }

      const filePath = path.join(this.collectionPath, `${docId}.json`);
      fs.readFile(filePath, 'utf-8', (err, data) => {
         // Perform error handling
         if (err) return cb(err);

         // on successfull read operation return by calling the callback
         return cb(err, utilities.parseJSON(data));
      })
   }

   // update a document
   update(docId, doc, cb) {
      // Perform error handling
      cb = typeof cb === 'function' ? cb : (err, doc) => { };
      if (!docId || typeof docId !== 'string') {
         const error = new Error('InputError: Document ID must be a string and not empty');
         return cb(error);
      }

      if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
         const error = new Error("InputError: Document data must be an object");
         return cb(error);
      }

      // step 1: open the file or doc to update
      const filePath = path.join(this.collectionPath, `${docId}.json`);
      fs.open(filePath, 'r+', (err, fileDescriptor) => {
         // Perform error validation
         if (err || !fileDescriptor) {
            const error = new Error('Could not open the document for updating: Document may not exist');
            return cb(error);
         }

         // step 2: read the file and extract the old data
         fs.readFile(fileDescriptor, 'utf-8', (err, data) => {
            // Perform error validation
            if (err) {
               const error = new Error('Error occured while reading the existing document');
               return cb(error);
            }

            // parse the data to an object
            const oldDoc = utilities.parseJSON(data);
            if (!oldDoc || Object.keys(oldDoc).length === 0) {
               const error = new Error('Error: Existing document is empty or corrupted');
               return cb(error);
            };

            // step 3: Truncate the file
            fs.ftruncate(fileDescriptor, (err) => {
               // Perform error validation
               if (err) {
                  const error = new Error('Error occured while truncating the document');
                  return cb(error);
               }

               // step 4: update the file or doc and close it
               const updatedDoc = { ...oldDoc, ...doc, _id: docId };
               fs.writeFile(fileDescriptor, JSON.stringify(updatedDoc), (err) => {
                  // Perform error validation
                  if (err) {
                     const error = new Error('Error occured while writing to existing document');
                     return cb(error);
                  }

                  // step 5 Close the file
                  fs.close(fileDescriptor, (err) => {
                     // Perform error validation
                     if (err) {
                        const error = new Error('Error occured while closing the document file');
                        return cb(error);
                     }

                     // Return by calling the callback
                     return cb(null, doc);
                  });
               });
            });
         });
      });
   }

   // delete a document
   delete(docId, cb) {
      // step 1: perform error handling
      cb = typeof cb === 'function' ? cb : (err, deletedDoc) => { };
      if (!docId || typeof docId !== 'string') {
         const error = new Error('InputError: Document ID must be a string and not empty');
         return cb(error);
      }

      const filePath = path.join(this.collectionPath, `${docId}.json`);
      // step 2: check if the file exists
      fs.access(filePath, fs.constants.F_OK, (err) => {
         if (err) {
            const error = new Error('Error: Document does not exist');
            return cb(error);
         }

         // step 3: read the file to get the document data before deleting
         fs.readFile(filePath, 'utf-8', (err, data) => {
            // Perform error handling
            if (err) {
               const error = new Error('Error occured while reading the document to be deleted');
               return cb(error);
            }

            // parse the data to an object
            const doc = utilities.parseJSON(data);
            if (!doc || Object.keys(doc).length === 0) {
               const error = new Error('Error: Document is empty or corrupted');
               return cb(error);
            };

            // Unlink or delete the file
            fs.unlink(filePath, (err) => {
               // Perform error handling
               if (err) {
                  const error = new Error('Error occured while deleting the document');
                  return cb(error);
               }

               // on successfull delete operation return by calling the callback
               return cb(null, doc);
            });
         });

      });
   };
}

module.exports = Collection;