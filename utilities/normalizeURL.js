// module dependencies

/**
 * @name normalizeURL
 * @description normalize a url string
 * @param {string} inputURL - user provided url string
 * @param {string} protocol - url protocol ('http' is the default vlaue)
 * @returns {string|null} - returns a normalized version of url or null if invalid
 * @author Omar Bin Saleh
 * @contact omarbinsaleh44@gmail.com
 * @Date 12/8/2025
 */
const normalizeURL = (inputUrl, protocol = 'http', options = { strict: false }) => {

   // handleError function defination
   const handleError = (errorType, message) => {
      if (options.strict) {
         const error = new Error(message);
         error.name = errorType;
         throw error;
      };

      return null;
   };


   try {
      if (typeof inputUrl !== 'string' || inputUrl.length < 'http://'.length) {
         const errorType = 'InputError';
         const errorMessage = 'Invalid url';
         return handleError(errorType, errorMessage);
      };

      // check if the user provided url start with either 'http://' or the 'https://' protocol
      // if yes, parse ther url directly and return the href attribute of the parsed url
      if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
         // create an URL and return the url
         const url = new URL(inputUrl);
         return url.href;
      };

      // check if the user provided protocol is valid or not
      if (!['http', 'https'].includes(protocol.toLowerCase())) {
         const errorType = 'InputError';
         const errorMessage = 'Invalid protocol';
         return handleError(errorType, errorMessage);
      };

      // parse the user provided url with protocol being manually added to the url
      // and then return the 'href' attribute of the parsed url
      const url = new URL(`${protocol.toLowerCase()}://${inputUrl}`);
      return url.href;

   } catch (error) {
      const errorType = 'ParseError';
      const errorMessage = `Could not normalize URL: ${error.message}`;

      return handleError(errorType, errorMessage);
   }
}

// export the module
module.exports = normalizeURL;