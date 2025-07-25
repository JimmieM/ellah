import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const keyLength = 32; // for aes-256-cbc
const ivLength = 16; // for aes-256-cbc

function getDerivedKey(password: string, salt: string) {
   return crypto.scryptSync(password, salt, keyLength);
}

export function encrypt(text: string, password: string) {
   const salt = crypto.randomBytes(keyLength).toString('hex'); // create a new salt
   const key = getDerivedKey(password, salt);
   const iv = crypto.randomBytes(ivLength);
   const cipher = crypto.createCipheriv(algorithm, key, iv);
   let encrypted = cipher.update(text, 'utf8', 'hex');
   encrypted += cipher.final('hex');
   return `${iv.toString('hex')}:${salt}:${encrypted}`; // prepend IV and salt to the encrypted data
}

export function decrypt(text: string, password: string) {
   const textParts = text.split(':');
   const iv = Buffer.from(textParts.shift()!, 'hex');
   const salt = textParts.shift();
   const encryptedText = textParts.join(':');
   const key = getDerivedKey(password, salt!);
   const decipher = crypto.createDecipheriv(algorithm, key, iv);
   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
   decrypted += decipher.final('utf8');
   return decrypted;
}
