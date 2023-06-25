import { encrypt } from '../../crypto/aes-256.crypto.js';
import getPassword from '../../input/get-password.prompt.js';
import { writeFile } from '../../util/file.util.js';
import { buildPath } from '../../util/path.util.js';
import { loadConfig } from '../user-config.js';

export const exportConfig = async (dir: string): Promise<void> => {
   const password = await getPassword(
      'Enter a password to encrypt configuration file:',
   );

   const config = loadConfig();
   const stringifiedConfig = JSON.stringify(config);
   const encrypted = encrypt(stringifiedConfig, password);

   writeFile(buildPath(dir, 'config.enc'), encrypted);
};
