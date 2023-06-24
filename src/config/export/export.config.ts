import { encrypt } from '../../crypto/aes-256.crypto';
import getPassword from '../../input/get-password.prompt';
import { writeFile } from '../../util/file.util';
import { buildPath } from '../../util/path.util';
import { loadConfig } from '../user-config';

export const exportConfig = async (dir: string): Promise<void> => {
   const password = await getPassword();

   const config = loadConfig();
   const stringifiedConfig = JSON.stringify(config);
   const encrypted = encrypt(stringifiedConfig, password);

   writeFile(buildPath(dir, 'config.enc'), encrypted);
};
