// module dependencies

// module defination
const validateProtocol = (protocol) => {
   const validProtocols = ['http', 'https'];

   // check if the protocol is a string data type
   // if not, return false or 0
   if (typeof protocol !== 'string') return 0;

   // check if the protocol is a valid protocol
   // if not, return false or 0;
   if (!validProtocols.includes(protocol)) {
      return 0;
   }

   // return the valid protocol
   return protocol;
};

// export the mdoule
module.exports = validateProtocol;