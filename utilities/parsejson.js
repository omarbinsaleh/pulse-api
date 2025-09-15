// module dependencies

// @name       : parseJSON
// @description: validate the JSON data coming from the client and accept only valid JSON and parse it
// @author     : Omar Bin Saleh
// @contact    : omarbinsaleh44@gmail.com
const parseJSON = (data, options = {strict: false}) => {
   // Pass-through if already an object
   if (data && typeof data === 'object') return data;

   if (typeof data !== 'string' || !data.trim().length) {
      if (options.strict) throw new Error('Invalid input: must be a non-empty JSON string');
      return {};
   }

   try {
      return JSON.parse(data);
   } catch (err) {
      if (options.strict) throw err;
      return {};
   }
};

// export the parseJSON 
module.exports = parseJSON;