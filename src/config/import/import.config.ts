import { decrypt } from '../../crypto/aes-256.crypto.js';
import getPassword from '../../input/get-password.prompt.js';
import { readFile } from '../../util/file.util.js';
import { saveConfig } from '../user-config.js';

export const importConfig = async (filePath: string): Promise<void> => {
   return new Promise(async (resolve, reject) => {
      const password = await getPassword();

      const file = await readFile(filePath);
      try {
         const decryptedData = decrypt(file, password);

         // Attempt to parse the decrypted data as JSON
         const config = JSON.parse(decryptedData);

         saveConfig(config);
         resolve();
      } catch (error) {
         reject();
      }
   });
};