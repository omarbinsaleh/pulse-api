// controller dependencies
const myToken = require('../lib/my-token/mytoken.js');
const blackListTokenCollection = require('../collections/blackListTokenCollection.js');
const checksCollection = require('../collections/checksCollection.js');
const userCollection = require('../collections/userCollection.js');
const env = require('../env/environment.js');
const utilities = require('../utilities')

// contorller scaffolding
const checksControllers = {};

/**
 * Controller function to register a new check in the system
 * 
 * @name createCheck
 * @description Creates a new check
 * @route POST /checks/register
 * @access Private API. (requires authentication token and authorization)
 * @param {Object} req - HttpRequest Object
 * @param {Object} res - HttpResponse Object
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
checksControllers.createCheck = (req, res) => {
   try {
      // extract the token either from the http-cookies or the authorization header
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

      // check if the token is found
      // if not, send an error response to the client
      if (!token) {
         return res.status(403).json({ success: false, message: 'Access Forbiden: Token Not Found' });
      };

      // extract data from the request body
      const protocol = utilities.validateProtocol(req.body?.protocol);
      const url = utilities.normalizeURL(req.body?.url, protocol);
      const method = req.body?.method;
      const successCodes = req.body?.successCodes;
      const timeoutSeconds = req.body?.timeoutSeconds;

      // validate the protocol
      // check if the protocol is a string and must be a valid protocol
      // if not, send an error response to the client
      if (!protocol || typeof protocol !== 'string' || !['http', 'https'].includes(protocol.toLowerCase())) {
         return res.status(400).json({ success: false, message: 'Input error: Invalid protocol' });
      }

      // validate the url and check if the url is a string data type
      // if not, send an error response to the client
      if (!url || typeof url !== 'string') {
         return res.status(400).json({ success: false, message: 'Input errror: Invalid url' });
      };

      // validate the method and make sure the method is a string
      // and check if the method is a valid method
      // if not, send an error response to the client
      if (!method || typeof method !== 'string' || !['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
         return res.status(400).json({ success: false, message: 'Input error: Invalid request method' });
      };

      // validate the success codes and check if it is an array data type
      // if not, send an error response to the client
      if (!successCodes || typeof successCodes !== 'object' || !Array.isArray(successCodes) || !successCodes.length) {
         return res.status(400).json({ success: false, message: 'Input error: Invalid status code' });
      };

      // validate the timeout seconds and check if the timeoutSeconds is a number
      // check if it is a number between 1 and 5
      // if not, send an error response to the client
      if (!timeoutSeconds || typeof timeoutSeconds !== 'number' || timeoutSeconds % 1 !== 0 || timeoutSeconds <= 1 || timeoutSeconds > 5) {
         return res.status(400).json({ success: false, message: 'Input error: Time seconds must be an any number between 1 and 5' });
      };

      // generate a token identifier from the token
      const tokenIdentifier = myToken.generateTokenIdentifier(token);
      if (!tokenIdentifier) {
         return res.status(400).json({ success: false, message: 'Unauthorized access: Invalid Token' });
      };

      // check if the token is blacklisted already using the token identifier
      // and make sure the token is not blacklisted befor proceeding for any further operation
      blackListTokenCollection.isTokenBlacklisted(tokenIdentifier, (err, isBlacklisted) => {
         // perform error validation
         // if error occurs, send an error response to the client
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         };

         // check if the token is blacklisted
         // if yes, send an error response to the client
         if (isBlacklisted) {
            return res.status(403).json({ success: false, message: 'Invalid token: Try with a new fresh token' });
         };

         // verify the token
         myToken.verify(token, env.SECRET, (err, decoded) => {
            if (err) {
               return res.status(403).json({ success: false, message: 'Unauthorized access: Could not verify the token' });
            };

            // check if the decoded object contains user's email and user phone
            // if not, send an error response to the client
            if (!decoded?.phone || !decoded?.email) {
               return res.status(403).json({ success: false, message: 'Unauthorized access: User phone or email missing in the token' });
            };

            // validate user identity using the user phone or email found in the token
            // read the user information and extract previous data
            const userIdentifier = decoded?.phone || decoded?.email;
            userCollection.read(userIdentifier, (err, user) => {
               // perform error validation
               // if error occures, send an error response to the client
               if (err) {
                  return res.status(403).json({ success: false, message: 'Unauthorized access: Could not identify the user' });
               };

               // make sure the number of checks added is not greater than 5
               const userChecks = user?.checks || []
               if (userChecks.length > 5) {
                  return res.status(400).json({ success: false, message: 'You are not allowed to add more than 5 checks' });
               };

               // create a check document
               const newCheck = {
                  _id: checksCollection.genereateUniqueId(),
                  userPhone: user.phone,
                  userEmail: user.email,
                  protocol: protocol?.toLowerCase(),
                  url,
                  method: method?.toUpperCase(),
                  successCodes,
                  timeoutSeconds,
                  createdAt: Date.now()
               };

               // save the new check 
               checksCollection.create(newCheck, newCheck._id, (err, newCheckDoc) => {
                  // perform error validation
                  if (err) {
                     return res.status(400).json({ success: false, message: 'Error occurred while saving the check' });
                  };

                  // create a new user with the new checks list
                  const newUser = {
                     ...user,
                     checks: [...userChecks, newCheckDoc._id],
                     updatedAt: Date.now()
                  };

                  // update the user with new checks list
                  userCollection.update(userIdentifier, newUser, (err, updatedUser) => {
                     // perform error validation and check if any error occures
                     // if yes, send an error response to the client
                     if (err) {
                        console.log(err);
                        return res.status(400).json({ success: false, message: err.message });
                     };

                     // send a success response to the client
                     return res.status(201).json({ success: true, message: 'Check added or registered successfully', user: updatedUser, check: newCheckDoc });
                  });
               });

            });

         });
      });
   } catch (error) {
      return res.status({ success: false, message: error.message });
   }
};

/**
 * Controller function to get a particular check data from the database
 * 
 * @name getCheck
 * @description find a check using ID and return the check
 * @route GET /checks/read?id=<'check_id'>&phone=<u'ser_phone'>&email=<'user_email'>
 * @access Private API, requires Token Authentication and Authorization
 * @param {Object} req - HttpRequest Object
 * @param {Object} res - HttpResponse Object
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
checksControllers.getCheck = (req, res) => {
   // extract the token from either coockies or headers
   // check if the token is found
   // if not, send an error response to the client
   const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
   if (!token) {
      return res.status(400).json({ success: false, message: 'UnAuthorized access: Token Not Found' });
   };

   // extract necessary data from the query parameters
   const { id: checkId, phone: userPhone, email: userEmail } = req.query;
   if (!checkId || !userPhone || !userEmail) {
      return res.status(400).json({ success: false, message: 'Check ID or User Phone or User Email is missing in the query parameters' });
   }

   // validate the check ID
   if (typeof checkId !== 'string' || !checkId.trim().length) {
      return res.status(400).json({success: false, message: 'Invalid check ID'});
   };

   // validate the user phone 
   if (typeof userPhone !== 'string' || !userPhone.trim().length || userPhone.trim().length < 11) {
      return res.status(400).json({success: false, message: 'Invalid user phone'});
   };

   // validate the user email
   if (typeof userEmail !== 'string' || !userEmail.trim().length) {
      return res.status(400).json({success: false, message: 'Invalid user email'});
   };

   // generate a token identifier form the token
   const tokenIdentifier = myToken.generateTokenIdentifier(token);
   if (!tokenIdentifier) {
      return res.status(400).json({ success: false, message: 'Unauthorized access: Invalid token, try with a valid token again' });
   };

   // check if the token is blacklisted
   blackListTokenCollection.isTokenBlacklisted(tokenIdentifier, (err, isBlacklisted) => {
      // perform error validation
      // if error occurs, send an error response to the client
      if (err) {
         return res.status(400).json({ success: false, message: err.message });
      };

      // if token is blacklised, send an error response to the client
      if (isBlacklisted) {
         return res.status(400).json({ success: false, message: 'Unauthorized access: Invalid token, try with a new fresh token' });
      }

      // verify the token
      myToken.verify(token, env.SECRET, (err, decoded) => {
         // perform error validation
         // if error occurs, send an error response to the client
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         };

         // validate the token information against the user's information like - userEmail, userPhone 
         if (decoded.email !== userEmail || decoded.phone !== userPhone) {
            return res.status(400).json({ success: false, message: 'Unauthorized access: You are not autorized to this resource' });
         };

         // read the requested check data from the database using the check id
         checksCollection.read(checkId, (err, checkDoc) => {
            // perform error validation
            // if error occurs, send an error response to the client
            if (err) {
               return res.status(400).json({ success: false, message: err.message });
            };

            // validate user credentials against the check object
            if (checkDoc.userPhone !== userPhone || checkDoc.userEmail !== userEmail) {
               return res.status(403).json({ success: false, message: 'Access Forbidden: You do not have access to this resource' });
            };

            // send a success response to the client
            return res.status(200).json({ success: true, message: 'Check is returned successfully', check: checkDoc });
         });
      })
   });
};


/**
 * Controller function to update an existing check data
 * 
 * @name: updateCheck
 * @description update a check document
 * @route PUT /checks/update
 * @access Private API, requires Authentication token and Authorization
 * @param {Object} req - HttpRequest object
 * @param {Object} res - HttpResponse object
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 */
checksControllers.updateCheck = (req, res) => {
   try {
      // extract token from either cookies or from the authorization header
      const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
      if (!token) {
         return res.status(400).json({ success: false, message: 'Unauthorize access: Token not found' });
      };

      // extract data from the request body and from the url query parameter
      const checkId = req.query?.id || req.body?.id;
      const protocol = utilities.validateProtocol(req.body?.protocol);
      const url = utilities.normalizeURL(req.body?.url, protocol);
      const method = req.body?.method;
      const successCodes = req.body?.successCodes;
      const timeoutSeconds = req.body?.timeoutSeconds;
      const userEmail = req.query?.email || req.body?.email;
      const userPhone = req.query?.phone || req.body?.phone;

      // validate the protocol
      if (!protocol || typeof protocol !== 'string' || !['http', 'https'].includes(protocol.trim().toLowerCase())) {
         return res.status(400).json({ success: false, message: 'InputError: Invalid protocol' });
      };

      // validate the url 
      if (!url || typeof url !== 'string') {
         return res.status(400).json({ success: false, message: 'InputError: Invalid URL' });
      };

      // validate the method
      if (!method || typeof method !== 'string' || !['GET', 'POST', 'PUT', 'DELETE'].includes(method.trim().toUpperCase())) {
         return res.status(400).json({ success: false, message: 'InputError: Method must be an string' });
      };

      // validate the successCodes
      if (!successCodes || typeof successCodes !== 'object' || !Array.isArray(successCodes) || !successCodes.length) {
         return res.status(400).json({ success: false, message: 'InputError: successCodes must be an an array of valid status codes' });
      };

      // validate the timeoutSeconds
      if (!timeoutSeconds || typeof timeoutSeconds !== 'number' || timeoutSeconds < 1 || timeoutSeconds > 5) {
         return res.status(400).json({ success: false, message: 'InputError: timeoutSeconds must be a number between 1 and 5' })
      };

      // generate a token identifier from the token
      const tokenIdentifier = myToken.generateTokenIdentifier(token);
      if (!tokenIdentifier) {
         return res.status(400).json({ success: false, message: 'Unauthorized access: Invalid token, try with a valid token later' });
      }

      // check if the token is blacklisted
      blackListTokenCollection.isTokenBlacklisted(tokenIdentifier, (err, isBlacklisted) => {
         // perform error validation
         // if error occurs while validating blacklisted token, send an error response to the client
         if (err) {
            return res.status(400).json({ success: false, message: err.message });
         };

         // if the token is blacklisted, send an error response to the client
         if (isBlacklisted) {
            return res.status(400).json({ success: false, message: 'Unauthorized access: Token blacklisted already' });
         };

         // verify the token
         myToken.verify(token, env.SECRET, (err, decoded) => {
            // perform error validation
            if (err) {
               return res.status(400).json({ success: false, message: 'Unauthorized access: token verification failed' });
            };

            // authenticate user credentials
            if (userEmail !== decoded.email || userPhone !== decoded.phone) {
               return res.status(403).json({ success: false, message: 'Unauthorized access: Unauthorized user' });
            };

            // read the previous chack data
            checksCollection.read(checkId, (err, checkData) => {
               // perform error validation
               // if error occurs, send an error response to the client
               if (err) {
                  return res.status(400).json({ success: false, message: err.message });
               };

               // validate the check data against the user provided credential (e.g. userEmail, userPhone)
               // validate the ownership of the of Check Data against the user credentials
               // if any mismatch found between the user credentials and check data, send an error response to the client
               if (userPhone !== checkData.userPhone || userEmail !== checkData.userEmail) {
                  return res.status(403).json({ success: false, message: 'Access Forbidden: User access restricted to this resource' });
               };

               // create new check data
               const newCheckData = { ...checkData }
               newCheckData.protocol = protocol ? protocol.trim().toLowerCase() : checkData.protocol;
               newCheckData.url = url ? url.trim().toLowerCase() : checkData.url;
               newCheckData.method = method ? method.trim().toUpperCase() : checkData.method;
               newCheckData.successCodes = successCodes ? successCodes : checkData.successCodes;
               newCheckData.timeoutSeconds = timeoutSeconds ? timeoutSeconds : checkData.timeoutSeconds;

               // update the check document
               checksCollection.update(checkId, newCheckData, (err, updatedCheck) => {
                  // perform error validation
                  // if error occurs, send an error response to the client
                  if (err) {
                     return res.status(400).json({ success: false, message: err.message });
                  };

                  // send a success response to the client
                  return res.status(200).json({ success: true, message: 'Check updated successfully', check: updatedCheck });
               });
            });
         });
      });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message })
   }
};

/**
 * Controller function to delete a particular check data from the database
 * 
 * @name: deleteCheck
 * @description delete a check document
 * @path DELETE /chekcs/delete
 * @access Private API, requires Token Authentication and Authorization
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 * @param {Object} req - HttpRequest object
 * @param {Object} res - HttpResponse object
 */
checksControllers.deleteCheck = (req, res) => {
   // send a success response to the client
   return res.status(200).json({ success: true, message: 'Check deleted successfully' });
}

// export the checks controllers
module.exports = checksControllers;