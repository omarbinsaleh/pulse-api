// Import the dependencies
const utilities = require('../helpers/utilities.js');
const user = require('../lib/data.js');

// Module Scaffolding
const userControllers = {};

// Define controllers
userControllers.createUser = (req, res) => {
   const { name, email, phone, password } = req.body;
   if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
   }

   try {
      // hash the password
      const hashedPassword = utilities.generateHashedPassword(password);

      // create new user
      const newUser = {
         _id: phone,
         name,
         email,
         phone,
         password: hashedPassword
      }
      user.create('users', newUser.phone, newUser, (err) => {
         // perform error validation and send error response
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         }

         // send a success response to the client
         return res.status(201).json({ success: true, message: 'New user created successfully', user: newUser });
      });
   } catch (error) {
      // catch the error and send an error response to the client
      return res.status(400).json({ success: false, message: error.message });
   }
};

// @name: loginUser
// @desc: login an existing user
// @auth: Omar Bin Saleh
userControllers.loginUser = (req, res) => {
   // validate the user's credentials

   // handle and send a success message to the client
   return res.status(200).json({success: true, message: 'User login successfull'});
};

// @name: getUserProfile
// @desc: get an existing user profile
// @auth: Omar Bin Saleh
userControllers.getUserProfile = (req, res) => {
   // validate the client

   // send a success message to the client
   res.status(200).json({success: true, message: 'User profile is returned successfully'});
};

// @name: deleteUser
// @desc: delete an existing user
// @auth: Omar Bin Saleh
userControllers.deleteUser = (req, res) => {
   // validate the client and the role of the client

   // send a success message to the client
   res.tatus(200).json({success: true, message: 'User deleted successfully'});
};

// @name: logoutUser
// @desc: logout an existing user
// @auth: Omar Bin Saleh
userControllers.logoutUser = (req, res) => {
   // validate the user

   // send a success message to the client
   res.status(200).json({success: true, message: 'User logout successful'});
};

//  export the user controllers
module.exports = userControllers;