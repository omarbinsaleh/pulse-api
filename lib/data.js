// Dependencies
const fs = require('fs');
const path = require('path');

// Module Scaffolding
const lib = {};

// @name: create
// @desc: write data
// @auth: Omar Bin Saleh
lib.create = (dir, file, data, cb) => {
   cb = typeof cb === 'function' ? cb : (err) => {};
   if (!dir) return cb("Error: Please provide a directory name");
   if (!data) return cb("Error: data can be empty");

   const pathName = path.join(__dirname, '../.data', dir, '/', file + '.json');
   fs.open(pathName, 'wx', (err, fileDescriptor) => {
      // perform error validation
      if (err || !fileDescriptor) {
         return cb('Could not create new file, it may already exits!');
      }

      // write data to the file
      fs.writeFile(fileDescriptor, JSON.stringify(data), (err) => {
         // perform error validation
         if (err) {
            return cb('Error happened while writing to new file');
         }

         // close the file
         fs.close(fileDescriptor, (err) => {
            // perform error validation
            if (err) {
               return cb('Error happened while closing the file');
            }

            // return by calling the callback
            return cb(false);
         })
      })
   })
}

// Export the lib Module
module.exports = lib;