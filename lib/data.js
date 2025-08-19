// Dependencies
const fs = require('fs');
const path = require('path');

// Module Scaffolding
const lib = {};

// @name: create
// @desc: write data
// @auth: Omar Bin Saleh
lib.create = (dir, file, data, cb) => {
   cb = typeof cb === 'function' ? cb : (err) => { console.log(err) };
   if (!dir) return cb("Error: Please provide a directory name");
   if (!data) return cb("Error: data can be empty");

   const pathName = path.join(__dirname, '../.data', dir, '/', file + '.json');
   fs.open(pathName, 'wx', (err, fileDescriptor) => {
      // perform error validation
      if (err || !fileDescriptor) {
         return cb('Could not create new file, it may already exits!');
      };

      // write data to the file
      fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
         // perform error validation
         if (err) {
            return cb('Error happened while writing to new file');
         };

         // close the file
         fs.close(fileDescriptor, (err) => {
            // perform error validation
            if (err) {
               return cb('Error happened while closing the file');
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
   if (!dir || !file) return cb('Directory name or the file name can be empty');

   const pathName = path.join(__dirname, '../.data', dir, '/', file + '.json');
   fs.readFile(pathName, 'utf-8', (err, data) => {
      // perform error validation
      if (err && !data) return cb(err, data)

      // on successful opeeration call the callback with the error and data passed to it as argument
      return cb(err, data);
   })
}

// @name: update
// @desc: Update an existing file content
// @auth: Omar Bin Saleh
lib.update = (dir, file, data, cb) => {
   cb = typeof cb === 'function' ? cb : (err) => console.log(err);
   if(!dir || !file) return cb("Error: Directory name and the file name can be empty");
   if(!data) return cb("Error: No data to update")

   // step 1: open the file to update
   const pathName = path.join(__dirname, '../.data', dir, file + '.json');
   fs.open(pathName, 'r+', (err, fileDescriptor) => {
      // perform error validation
      if (err) return cb('Error: could not open the file');

      // step 2: truncate the file
      fs.ftruncate(fileDescriptor, (err) => {
         // perform error validation
         if (err) return cb('Error: could not truncate the file');

         // step 3: write or update the file
         fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
            // perform error validation
            if (err) return cb('Error: could not write or update the file');

            // step 4: close the file
            fs.close(fileDescriptor, (err) => {
               // perform error validation
               if (err) return cb('Error: could not close the file');

               // on successful operation return by calling the callback with error equal to false
               return cb(false);
            });
         });
      });
   });
};

// Export the lib Module
module.exports = lib;