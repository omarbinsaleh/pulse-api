// module dependencies

// module scaffolding
const normalizeURL = (inputUrl, protocol = 'http') => {
   if (typeof inputUrl !== 'string' || inputUrl.length < 'hppt://'.length) {
      console.error('InavlidInputError: url string');
      return 0;
   };

   if (!['http', 'https'].includes(protocol)) {
      console.log('InputError: Invalid Protocol');
      return 0;
   };

   try {
      let url;

      // check if the user provided url start with either 'http://' or the 'https://' protocol
      // if yes, parse ther url directly and return the href attribute of the parsed url
      if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
         // create an URL and return the url
         url = new URL(inputUrl);
         return url.href;
      };
      
      // parse the user provided url with protocol being manually added to the url
      // and then return the 'href' attribute of the parsed url
      url = new URL(`${protocol}://${inputUrl}`);
      return url.href;

   } catch (error) {
      const url = new URL(`${protocol}://${inputUrl}`);
      return url.href;
   }
}

// export the module
module.exports = normalizeURL;