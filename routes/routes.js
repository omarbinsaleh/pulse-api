// Import Controllers:
const serverControllers = require('../controllers/serverControllers.js');
const userControllers = require('../controllers/userControllers.js');
const checksControllers = require('../controllers/checksControllers.js');

// Register your routes here
const routes = [
   { path: '/', method: 'GET', handler: serverControllers.greetUser },

   { path: '/users/register', method: 'POST', handler: userControllers.createUser },
   { path: '/users/login', method: 'POST', handler: userControllers.loginUser },
   { path: '/users/profile', method: 'GET', handler: userControllers.getUserProfile },
   { path: '/users/delete', method: 'DELETE', handler: userControllers.deleteUser },
   { path: '/users/logout', method: 'GET', handler: userControllers.logoutUser },

   { path: '/checks/register', method: 'POST', handler: checksControllers.createCheck },
   { path: '/checks/read', method: 'GET', handler: checksControllers.getCheck },
   { path: '/checks/update', method: 'PUT', handler: checksControllers.updateCheck },
   { path: '/checks/delete', method: 'DELETE', handler: checksControllers.deleteCheck }
]

// Exports the routes
module.exports = routes;