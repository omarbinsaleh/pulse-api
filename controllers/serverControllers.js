// Import Dependencies

// Module Scaffolding
const serverControllers = {};

// Greet functions
serverControllers.greetUser = (req, res, next) => {
   res.status(201).json({message: "Welcome to the Pulse-API backend services"})

}

serverControllers.helloWorld = (req, res, next) => {
   console.log("Hello world");
   req.body = {
      firstMidlleware: "Hello world"
   }
   return next();
}

// export the module
module.exports = serverControllers;