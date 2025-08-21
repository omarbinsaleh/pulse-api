const fs = require('fs');
const path = require('path');

class Collection{
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

   // create a document
   create(doc, cb) {
      // Perform error handling
      cb = typeof cb === 'function' ? cb : (err, doc) => {};
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
      cb = typeof cb === 'function' ? cb : (err, doc) => {};
      if (!docId || typeof docId !== 'string') {
         const error = new Error('InputError: Document ID must be a string and not empty');
         return cb(error);
      }

      const filePath = path.join(this.collectionPath, `${docId}.json`);
      fs.readFile(filePath, 'utf-8', (err, data) => {
         // Perform error handling
         if (err) return cb(err);

         // on successfull read operation return by calling the callback
         return cb(err, JSON.parse(data));
      })
   }
}

module.exports = Collection;