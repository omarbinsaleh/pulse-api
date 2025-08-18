const mw1 = (req, res, next) => {
   console.log("middleware 1")
   next();
}
const mw2 = (req, res, next) => {
   console.log("middleware 2")
   next();
}
const mw3 = (req, res, next) => {
   console.log("middleware 3")
}
const mw4 = (req, res, next) => {
   console.log("middleware 4")
}

const middleware = [mw1, mw2, mw3, mw4];
let index = 0;

const next = () => {
   if (index <= middleware.length) {
      const target = middleware[index]
      index++ 
      
      target('omar', 'bin', next);
   }
}

const printName = (...name) => {
   const [firstName, ...midd] = name;
   console.log(midd);
}


next();

printName('omar', 'rima', 'hena');

