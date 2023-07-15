import { decrypt } from '../../crypto/aes-256.crypto.js';
import getPassword from '../../input/get-password.prompt.js';
import { readFile } from '../../util/file.util.js';
import { UserConfig } from '../user-config.model.js';

export const importConfig = async (
   filePath: string,
   saveConfig: (config: UserConfig) => void,
): Promise<void> => {
   return new Promise(async (resolve, reject) => {
      const password = await getPassword(
         'Enter your password to decrypt and import your configuration file:',
      );

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
