// Import Controllers:
const serverControllers = require('../controllers/serverControllers.js');

// Register Routes here
const routes = [
   {path: '/', method: 'GET', handler: serverControllers.greetUser}
]

// Exports the routes
module.exports = routes;