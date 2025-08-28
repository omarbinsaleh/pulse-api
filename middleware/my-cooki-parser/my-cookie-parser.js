// import dependenciis

// module
const myCookieParser = (req) => {
   // check if the cookies header exists
   // if not, return an empty object
   if (!req.headers.cookie) {
      return {};
   }

   // parse the cookies
   const cookies = {};
   const cookiesList = req.headers.cookie.split(';');
   if (cookiesList && Array.isArray(cookiesList) && cookiesList.length > 0) {
      cookiesList.forEach(cookie => {
         const [key, value] = cookie.split('=');
         cookies[key.trim()] = value.trim();
      })

      return cookies;
   } else{
      return {};
   }
}

// export the module
module.exports = myCookieParser;