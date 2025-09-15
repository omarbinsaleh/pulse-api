// Import the dependencies
const usersCollection = require('../collections/userCollection.js');
const blacklistTokenCollection = require('../collections/blackListTokenCollection.js');
const mytoken = require('../lib/my-token/mytoken.js');
const env = require('../env/environment.js');

// Module Scaffolding
const userControllers = {};
/**
 * Create or Register a new user in the system
 * 
 * @name createUser
 * @description A controller function to create a new user or register a new user in the system
 * @path POST /users/register
 * @access Public API end point, No authentication is required
 * @param {Object} req - HttpRequest Object
 * @param {Object} res - HttpResponse Object
 * @returns {object} JSON - JSON object
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
userControllers.createUser = (req, res) => {
   // extract data from the request body
   const { name, email, phone, password } = req.body;

   // check if all fields data such name, email, phone and password are provided
   // if not, send an error response to the client
   if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
   };

   // validate the user name
   if (typeof name !== 'string' || !name.trim().length) {
      return res.status(400).json({success: false, message: 'Invalid Name'});
   };

   // validate the user email
   if (typeof email !== 'string' || !email.trim().length) {
      return res.status(400).json({success: false, message: 'Invalid Email'});
   };

   // validate the user phone
   if (typeof phone !== 'string' || !phone.trim.length || phone.trim().length < 11) {
      return res.status(400).json({success: false, message: 'Inavlid phone number'});
   };

   // validate password
   if (typeof password !== 'string' || !password.trim().length) {
      return res.status(400).json({success: false, message: 'Invalid password'});
   };

   try {
      // hash the password
      const hashedPassword = usersCollection.hashPassword(password);

      // generate a unique ID for the new user
      const userId = usersCollection.genereateUniqueId();

      // create new user object
      const newUser = {
         identifier: phone || email,
         _id: userId,
         name,
         email,
         phone,
         password: hashedPassword
      };

      // generate token for the user
      const payload = { userIdentifier: newUser.identifier, _id: newUser._id, phone: user.phone, email: user.email };
      const token = mytoken.sign(payload, env.SECRET, { expiresIn: '1h' });
      if (!token) {
         return res.status(500).json({success: false, message: 'Failed to generate token'});
      }

      // store the new user into the database
      const identifier = newUser.identifier;
      usersCollection.create(newUser, identifier, (err, user) => {
         // perform error validation and send error response
         // if error occurs, send an error response to the client
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         }

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

/**
 * Allow an existing user to login
 * 
 * @name loginUser
 * @description A controller function to allow an existing user to login
 * @path POST /users/login
 * @access Public API end point
 * @param {Object} req - HttpRequest Object
 * @param {Object} res - HttpResponse Object
 * @returns {object} JSON - JSON object
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
userControllers.loginUser = (req, res) => {
   // validate the user's credentials
   // extract phone and password from the req.body
   const { phone, password } = req.body;

   // check if both phone and password are provided
   // if not, send an error response to the client
   if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
   };

   // validate the user phone 
   if (typeof phone !== 'string' || !phone.trim().length || phone.trim().length < 11) {
      return res.status(400).json({success: false, message: 'Invalid phone number'});
   };

   // validate the password
   if (typeof password !== 'string' || !password.trim().length) {
      return res.status(400).json({success: false, message: 'Invalid password'});
   };

   try {
      // check if the user exists using the phone as the unique indentifier
      const identifier = phone;
      usersCollection.read(identifier, (err, user) => {
         // perform error validation
         // if error occurs, send an error response to the client
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         }

         // validate the password
         // if the password is invalid, send an error response to the client
         const isPasswordValid = usersCollection.comparePassword(password, user.password);
         if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid phone or password' });
         };

         // generate token for the user
         const payload = { userIdentifier: user.identifier, _id: user._id, phone: user.phone, email: user.email };
         const token = mytoken.sign(payload, env.SECRET, { expiresIn: '1h' });
         if (!token) {
            return res.status(500).json({success: false, message: 'Failed to generate token'});
         }

         // set the token in the cookies
         res.setHeader('Set-Cookie', `token=${token}; HttpOnly; path=/; Max-Age=${1 * 60 * 60}`);

         // handle and send a success message to the client
         return res.status(200).json({ success: true, message: 'User login successfull', user: { ...user, password: null }, token });
      });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Provide profile information of an existing and loggedin user
 * 
 * @name getUserProfile
 * @description A controller function to get an existing user profile information
 * @path POST /users/profile?email=<'user_email'>&phone=<'user_phone'>
 * @access Private API, (requires authentication token and authorization)
 * @param {Object} req - HttpRequest Object
 * @param {Object} res - HttpResponse Object
 * @returns {object} JSON - JSON object
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
userControllers.getUserProfile = (req, res) => {
   // extract email and phone from the req.query
   // check if both email and phone are provided
   // if not, send an error response to the client
   const { email, phone } = req.query;
   if (!email || !phone) {
      return res.status(400).json({ success: false, message: 'User email and phone are missing' });
   };

   //validate the user email
   if (typeof email !== 'string' || !email.trim().length) {
      return res.status(400).json({success: false, message: 'Invalid user email'});
   };

   // validate the password
   if (typeof phone !== 'string' || !phone.trim().length || phone.trim().length < 11) {
      return res.status(400).json({success: false, message: 'Invalid user phone'});
   }

   // extract the token from the cookies or from the authorization header
   // check if the token is found
   // if not, send an error response to the client
   const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
   if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized access. Token is missing' });
   };

   try {
      // generate the token identifier
      // check if the token identifier is generated successfully
      const tokenIdentifier = mytoken.generateTokenIdentifier(token);
      if (!tokenIdentifier) {
         return res.status(400).json({ success: false, message: 'Invalid token' });
      };

      // check if the token is blacklisted already
      blacklistTokenCollection.isTokenBlacklisted(tokenIdentifier, (err, isBlacklisted) => {
         // check if the token is blacklisted
         // if yes, send an error response to the client
         if (isBlacklisted) {
            return res.status(401).json({ success: false, message: 'Unauthorized access. Token is blacklisted' });
         };

         // perform error validation
         // if error occurs, send an error response to the client
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         };

         // after all the validation above, it is now safe to verify the token
         // because the token is not blacklisted and  no error occured while checking if the token is blacklisted
         // verify the token
         mytoken.verify(token, env.SECRET, (err, decoded) => {
            // perform error validation
            // if error occurs, send an error response to the client
            if (err) {
               return res.status(401).json({ success: false, message: err.message });
            };

            // validate the user
            // the email and phone from the query parameter must be the same as the email and phone found in the decoded token
            // if not, send an error response to the client
            if (email !== decoded.email || phone !== decoded.phone) {
               return res.status(403).json({ success: false, message: 'Forbidden access. You are not allowed to access this resource' });
            };

            // check if the user exists by using the phone as the unique identifier
            const identifier = decoded.userIdentifier;
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
      });

   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }

};


/**
 * Controller function to delete an existing user from the system
 * 
 * @name deleteUser
 * @description Delete an exsting user from the database
 * @route DELETE /users/delete?email=<'user_email'>&phone=<'user_phone'>
 * @access Private API, requires Authentication token and Authorization
 * @param {Object} req - HttpRequest Object
 * @param {Object} res - HttpResponse Object
 * @returns {Object} JSON
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
userControllers.deleteUser = (req, res) => {
   // validate the client and the role of the client

   // send a success message to the client
   return res.status(200).json({ success: true, message: 'User deleted successfully' });
};


/**
 * Controller function to logout a user by invalidating their session or token.
 * 
 * @name logoutUser
 * @description A controller function to logout an existing user
 * @rotue GET /users/logout?email=<'user_email'>&phone=<'user_phone'>
 * @access Private API (requires Authentication Token and Authorization)
 * @param {Object} req - HttpRequest object with user email & phone in the query
 * @param {Object} res - HttpResponse object
 * @returns { Object } JSON - JSON object
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */ 
userControllers.logoutUser = (req, res) => {
   // extract user email and phone from the req.query
   // check if both the email and phone are provided
   // if not, send an error response to the client
   const { email, phone } = req.query;
   if (!email || !phone) {
      return res.status(400).json({ success: false, message: 'Provide user email and phone through the query parameter' });
   }

   // validate the email 
   if (typeof email !== 'string' || !email.trim().length) {
      return res.status(400).json({success: false, message: 'Invalid user email'});
   };

   // validate the user phone
   if (typeof phone !== 'string' || !phone.trim().length || phone.trim().length < 11) {
      return res.status(400).json({success: false, message: 'Invalid user phone number'});
   };

   // extract the token
   // check if the token is found
   // if not, send an error response to the client
   const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
   if (!token) {
      return res.status(403).json({ success: false, message: 'Unauthorized access: Token was not found' });
   };

   try {
      // verify the token
      mytoken.verify(token, env.SECRET, (err, decoded) => {
         // perform error validation
         // if error occurs, send an error response to the client
         if (err) {
            return res.status(403).json({ success: false, message: err.message });
         }

         // validate the user provided information
         // check if the email and phone from the query parameter are the same as the email and phone found in the decoded token
         // if not, send an error response to the client
         if (email !== decoded.email || phone !== decoded.phone) {
            return res.status(403).json({ success: false, message: 'Forbiden access: You are not allowed to perform this action' });
         }

         // validate the user
         // check if the user exist in the database by using the user identifier found in the decoded object
         const identifier = decoded.userIdentifier;
         usersCollection.read(identifier, (err, user) => {
            // perform error validation
            // if error occurs, send an error response to the client
            if (err) {
               return res.status(400).json({ success: false, message: err.message });
            }

            // check if the user id is the same as the id found in the decoded object
            // if not, send an error response to the client
            if (user._id !== decoded._id) {
               return res.status(403).json({ success: false, message: 'Forbiden access: You are not allowed to perform this action' });
            }

            // generate the token identifier
            // check if the token identifier is generated successfully
            // if not, send an error response to the client
            const tokenIdentifier = mytoken.generateTokenIdentifier(token);
            if (!tokenIdentifier) {
               return res.status(400).json({ success: false, message: 'Invalid token' });
            }
            
            // after all the validation, the user is valid and authorized to perform the logout operation
            // generate a unique id for the blacklisted token
            // save the token as a black listed token
            const tokenId = blacklistTokenCollection.genereateUniqueId();
            blacklistTokenCollection.create({ _id: tokenId, token }, tokenIdentifier, (err, tokenDoc) => {
               // perform error validation
               // if error occurs, send an error response to the client
               if (err) {
                  return res.status(400).json({ success: false, message: err.message })
               }

               // clear token from the http-cookies
               res.setHeader('Set-Cookie', `token=; HttpOnly; path=/; Max-Age=0`);

               // send a success response to the client
               return res.status(200).json({ success: false, message: 'User logout successfully', token });
            });
         });
      });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   };
};

//  export the user controllers
module.exports = userControllers;