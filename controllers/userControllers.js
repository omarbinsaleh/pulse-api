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
      const hashedPassword = usersCollection.hashPassword(password);

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

      usersCollection.create(newUser, newUser.phone, (err, user) => {
         // perform error validation and send error response
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         }

         // generate token for the user
         const payload = { _id: newUser._id, phone: user.phone, email: user.email };
         const token = mytoken.sign(payload, env.SECRET, { expiresIn: '1h' });

         // set token in cookies
         res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${1 * 60 * 60}`);

         // send a success response to the client
         return res.status(201).json({ success: true, message: 'New user created successfully', user: { ...user, password: null }, token });
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
   const { phone, password } = req.body;
   if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
   };

   // check if the user exists
   usersCollection.read(phone, (err, user) => {
      // perform error validation and send error response
      if (err) {
         return res.status(400).json({ success: false, message: err.message });
      }

      // validate the password
      const isPasswordValid = usersCollection.comparePassword(password, user.password);
      if (!isPasswordValid) {
         return res.status(400).json({ success: false, message: 'Invalid phone or password' });
      };

      // generate token for the user
      const payload = { _id: user._id, phone: user.phone, email: user.email };
      const token = mytoken.sign(payload, env.SECRET, { expiresIn: '1h' });

      // set the token in the cookies
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly; path=/; Max-Age=${1 * 60 * 60}`);

      // handle and send a success message to the client
      return res.status(200).json({ success: true, message: 'User login successfull', user: { ...user, password: null }, token });
   });
};

// @name: getUserProfile
// @desc: get an existing user profile
// @auth: Omar Bin Saleh
userControllers.getUserProfile = (req, res) => {
   // extract email and phone from the req.query
   // check if both email and phone are provided
   // if not, send an error response to the client
   const { email, phone } = req.query;
   if (!email || !phone) {
      return res.status(400).json({ success: false, message: 'Passing the both User Email and Phone is required through query parameter' });
   };

   // extract the token from the cookies or from the authorization header
   // check if the token is found
   // if not, send an error response to the client
   const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
   if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized access. Token is missing' });
   }

   // verify the token
   mytoken.verify(token, env.SECRET, (err, decoded) => {
      // perform error validation
      // if error occurs, send an error response to the client
      if (err) {
         return res.status(401).json({ success: false, message: 'Unauthorized access. Invalid token' });
      };

      // validate the user
      // the email and phone from the query parameter must be the same as the email and phone found in the decoded token
      // if not, send an error response to the client
      if (email !== decoded.email || phone !== decoded.phone) {
         return res.status(403).json({ success: false, message: 'Forbidden access. You are not allowed to access this resource' });
      };

      // check if the user exists by using the phone as the unique identifier
      const identifier = phone;
      usersCollection.read(identifier, (err, user) => {
         // perform error validation
         // if error occurs, send an error response to the client
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         };

         // check if the user id is the same as the decoded user id from the token
         // if not, send an error response to the client
         if (user._id !== decoded._id) {
            return res.status(403).json({ success: false, message: 'Forbidden access. You are not allowed to access this resource' });
         };

         // after all the validation, the user is valid and authorized to access the resource
         // finally send a success message to the client
         return res.status(200).json({ success: true, message: 'User profile fetched successfully', user: { ...user, password: null } });
      });
   });

};

// @name: deleteUser
// @desc: delete an existing user
// @auth: Omar Bin Saleh
userControllers.deleteUser = (req, res) => {
   // validate the client and the role of the client

   // send a success message to the client
   res.tatus(200).json({ success: true, message: 'User deleted successfully' });
};

// @name: logoutUser
// @desc: logout an existing user
// @auth: Omar Bin Saleh
userControllers.logoutUser = (req, res) => {
   // validate the user

   // send a success message to the client
   res.status(200).json({ success: true, message: 'User logout successful' });
};

//  export the user controllers
module.exports = userControllers;