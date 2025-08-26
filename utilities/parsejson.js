// @name: parseJSON
// @desc: validate the JSON data coming from the client and accept only valid JSON and parse it
// @auth: Omar Bin Saleh
const parseJSON = (data) => {
   if (typeof data !== 'string') return {};

   try {
      return JSON.parse(data);
   } catch (error) {
      return {};
   }
};

// export the parseJSON 
module.exports = parseJSON;