// module dependencies

// module scaffolding
const notification = {};

notification.sendMessage = (number, message) => {
   try {
      if (typeof number !== 'number' || String(number).length !== 10) return;

      return console.log(`${message} has been sent to this number ${number}`);
   } catch (error) {
      console.log(error);
   }
};

// export the module
module.exports = notification;