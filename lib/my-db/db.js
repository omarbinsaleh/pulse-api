const fs = require('fs');
const path = require('path');
const Collection = require('./collection.js');

class DB {
   constructor(name) {
      this.name = typeof name === 'string' ? name : 'defaultDB';
      this.dbPath = path.join(__dirname, '../../.DB', name);
      this.collections = []

      // Initialize the database by creating the directory if it doesn't exist
      fs.mkdir(this.dbPath, { recursive: true }, function (err, path) {
         if (err) throw err;
         return true;
      });
   }

   createCollection(collectionName) {
      const collection = new Collection(this.dbPath, collectionName);
      this.collections.push(collection);
      return collection;
   }
}

const createDB = (name) => {
   return new DB(name);
};

module.exports = createDB;
