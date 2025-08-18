// Import Controllers:
const userControllers = require('../controllers/userControllers.js');
const serverControllers = require('../controllers/serverControllers.js');

// Define Routes
const routes = [
   {path: '/', method: 'GET', handler: serverControllers.greetUser}
]

// Exports the routes
module.exports = routes;