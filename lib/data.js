// Dependencies
const fs = require('fs');
const path = require('path');

// Module Scaffolding
const lib = {};

// @name: create
// @desc: write data
// @auth: Omar Bin Saleh
lib.create = (dir, file, data, cb) => {
   // perform error handling
   cb = typeof cb === 'function' ? cb : (err) => { console.log(err) };
   if (!dir) {
      const error = new Error("Error: Please provide a directory name")
      return cb(error);
   };

   if (!data) {
      const error = new Error("Error: data can be empty");
      return cb(error);
   };

   const pathName = path.join(__dirname, '../.data', dir, '/', file + '.json');
   fs.open(pathName, 'wx', (err, fileDescriptor) => {
      // perform error validation
      if (err || !fileDescriptor) {
         const error = new Error('Could not create new file: No such directory found or the same may already exits!')
         return cb(error);
      };

      // write data to the file
      fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
         // perform error validation
         if (err) {
            const error = new Error('Error happened while writing to new file')
            return cb(error);
         };

         // close the file
         fs.close(fileDescriptor, (err) => {
            // perform error validation
            if (err) {
               const error = new Error('Error happened while closing the file')
               return cb(error);
            };

            // return by calling the callback
            return cb(false);
         });
      });
   });
};

// @name: read
// @desc: read content from a file
// @auth: Omar Bin Saleh
lib.read = (dir, file, cb) => {
   cb = typeof cb === 'function' ? cb : (err) => { console.log(err) };
   if (!dir || !file) {
      const error = new Error('Directory name or the file name can be empty');
      return cb(error);
   }

   const pathName = path.join(__dirname, '../.data', dir, '/', file + '.json');
   fs.readFile(pathName, 'utf-8', (err, data) => {
      // perform error validation
      if (err && !data) {
         const error = new Error('Error happended while reading file');
         return cb(error, data)
      }

      // on successful opeeration call the callback with the error and data passed to it as argument
      return cb(err, data);
   })
}

// @name: update
// @desc: Update an existing file content
// @auth: Omar Bin Saleh
lib.update = (dir, file, data, cb) => {
   // perform error validtion
   cb = typeof cb === 'function' ? cb : (err) => console.log(err);
   if(!dir || !file) {
      const error = new Error("Error: Directory name and the file name can be empty");
      return cb(error);
   }

   if(!data) {
      const error = new Error("Error: No data is provided");
      return cb(error);
   }

   // step 1: open the file to update
   const pathName = path.join(__dirname, '../.data', dir, file + '.json');
   fs.open(pathName, 'r+', (err, fileDescriptor) => {
      // perform error validation
      if (err) {
         const error = new Error('Error: could not open the file');
         return cb(error);
      }

      // step 2: truncate the file
      fs.ftruncate(fileDescriptor, (err) => {
         // perform error validation
         if (err) {
            const error = new Error('Error: could not truncate the file');
            return cb(error);
         }

         // step 3: write or update the file
         fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
            // perform error validation
            if (err) {
               const error = new Error('Error: could not write or update the file');
               return cb(error);
            }

            // step 4: close the file
            fs.close(fileDescriptor, (err) => {
               // perform error validation
               if (err) {
                  const error = new Error('Error: could not close the file');
                  return cb(error);
               }

               // on successful operation return by calling the callback with error equal to false
               return cb(false);
            });
         });
      });
   });
};

// @name: delete
// @desc: delete an existing file
// @auth: Omar Bin Saleh
lib.delete = (dir, file, cb) => {
   // perform error validation
   cb = typeof cb === 'function' ? cb : (err) => console.log(err)
   if (!dir || !file) {
      const error = new Error('Input Error: directory name and file name must be provided');
      return cb(error);
   }

   // delete the existing file
   const pathName = path.join(__dirname, '../.data', dir, file + '.json');
   fs.unlink(pathName, (err) => {
      // perform error validation
      if (err) {
         const error = new Error('Unlik Error: Could not delete, No such file or directory found');
         return cb(error);
      }

      return cb(false);
   })
}

// Export the lib Module
module.exports = lib;