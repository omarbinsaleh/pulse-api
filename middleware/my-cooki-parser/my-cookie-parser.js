// Module Dependencies

/**
 * @name myCookieParser
 * @description Parses cookies from the HTTP request header into a key-value object.
 * @param {Object} req - HttpRequest object containing headers
 * @returns {Object} Parsed cookies as key-value pairs
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 * @example
 * const cookies = myCookieParser(req);
 * console.log(cookies.sessionId); // outputs the sessionId cookie value
 */
const myCookieParser = (req) => {
   // check if the cookies header exists
   // if not, return an empty object
   if (!req.headers.cookie) {
      return {};
   };

   // parse the cookies
   const cookies = {};
   const cookiesList = req.headers.cookie.split(';');
   if (cookiesList && Array.isArray(cookiesList) && cookiesList.length > 0) {
      cookiesList.forEach(cookie => {
         const [key, value] = cookie.split('=');
         cookies[key.trim()] = value.trim();
      });

      return cookies;
   } else{
      return {};
   };
};

// export the module
module.exports = myCookieParser;