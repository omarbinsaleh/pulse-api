// Import Controllers:
const serverControllers = require('../controllers/serverControllers.js');
const userController = require('../controllers/userControllers.js');

// Register Routes here
const routes = [
   // server specific routs
   {path: '/', method: 'GET', handler: serverControllers.greetUser},

   // user specific routes
   {path: '/users/register', method: 'POST', handler: userController.createUser},
   {path: '/users/login', method: 'POST', handler: userController.loginUser},
   {path: '/users/profile', method: 'GET', handler: userController.getUserProfile},
   {path: '/users/delete', method: 'GET', handler: userController.deleteUser},
   {path: '/users/logout', method: 'GET', handler: userController.logoutUser}
]

// Exports the routes
module.exports = routes;