const crypto = require('crypto');

// Module Scaffolding
const mytoken = {};

// Generate a random token
mytoken.sign = (payload, secrete, { expiresIn = '1h' } = {}) => {
   // create the header and convert it to base64url string
   const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');

   // noramly the Date.now() returns current time in milliseconds
   // but we need it in seconds so we divide it by 1000 
   // and use Math.floor() to round it down to the nearest whole number
   // if expiresIn is a string like '1h', we convert it to seconds
   const exp = Math.floor(Date.now() / 1000) + (typeof expiresIn === 'string' ? parseInt(expiresIn) * 3600 : expiresIn);

   // create the body and convert it to base64url string
   // we add the exp property to the payload
   const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');

   // create the signature using HMAC with SHA256 algorithm
   // and convert it to base64url string
   const signature = crypto.createHmac('sha256', secrete).update(`${header}.${body}`).digest('base64url');

   // create token in the format of header.body.signature
   const token = `${header}.${body}.${signature}`;

   // return the token
   return token;
}

// verify the token
mytoken.verify = (token, secrete) => {
   const [header, body, signature] = token.split('.');
   if (!header || !body || !signature) {
      const error = new Error('Invalid token format');
      error.name = 'InvalidTokenError';
      throw error;
   }

   const expectedSignature = crypto.createHmac('sha256', secrete).update(`${header}.${body}`).digest('base64url');
   if (signature !== expectedSignature) {
      const error = new Error('Invalid token signature');
      error.name = 'InvalidSignatureError';
      throw error;
   }

   const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
   if (payload.exp < Math.floor(Date.now() / 1000)) {
      const error = new Error('Token has expired');
      error.name = 'TokenExpiredError';
      throw error;
   }

   // return the payload if the token is valid
   return payload;
}

// export the mytoken module
module.exports = mytoken;