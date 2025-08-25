// Import the dependencies
const utilities = require('../helpers/utilities.js');
const usersCollection = require('../collections/userCollection.js');
const tokenCollection = require('../collections/tokenCollection.js');
const mytoken = require('../lib/my-token/mytoken.js');
const env = require('../env/environment.js');

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

      // generate a unique ID
      const userId = usersCollection.genereateUniqueId();

      // create new user
      const newUser = {
         _id: userId,
         name,
         email,
         phone,
         password: hashedPassword
      };

      usersCollection.create(newUser, newUser.phone, (err) => {
         // perform error validation and send error response
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         }

         // generate token for the user
         const token = mytoken.sign({_id: newUser._id}, env.SECRET, {expiresIn: '2h'});

         // store the token in the token collection
         const tokenId = tokenCollection.genereateUniqueId()
         tokenCollection.create({_id: tokenId, token}, tokenId , (err) => {
            if (err) {
               return res.status(500).json({ success: false, message: 'Error storing user token' });
            }

            // set token in cookies
            res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${2 * 60 * 60}`);

            // send a success response to the client
            return res.status(201).json({ success: true, message: 'New user created successfully', user: newUser, token });
         })

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
   // extract the token 
   const token = req.headers.authorization?.split(' ')[1];
   if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized access. Token is missing' });
   }

   // validate the client
   const userId = req.body._id;
   if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
   }

   usersCollection.read(userId, (err, user) => {
      // perform error validation and send error response
      if (err) {
         return res.status(400).json({ success: false, message: err.message });
      }

      // send a success message to the client
      res.status(200).json({success: true, message: 'User profile is returned successfully', user: {...user, password: null}});
   })

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