// module dependencies

// module scaffolding
const notification = {};

notification.sendMessage = (number, message) => {
   try {
      if (typeof number !== 'number' || String(number).length !== 10) return message;

      // send the message
      console.log(`${message} has been sent to this number ${number}`);
      return message;
   } catch (error) {
      console.log(error);
      return null
   }
};

// export the module
module.exports = notification;