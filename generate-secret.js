import crypto from 'crypto';

// Generate a random string of 64 bytes (512 bits) and convert it to base64
const secret = crypto.randomBytes(64).toString('base64');
console.log('Your JWT Secret:', secret); 