import os from 'os';
import path from 'path';
import fs from 'fs';

// Location of the config directory and file
const baseDir = path.join(os.homedir(), '.ellah-cli');
const syncPath = path.join(baseDir, '/temp');

export const getTemporaryFilePath = (
   entityPath: string,
   filePath: string,
): string => {
   const scriptPath = `${syncPath}/${entityPath}/${filePath}`;

   try {
      fs.mkdirSync(`${syncPath}/${entityPath}`, { recursive: true });
   } catch (e) {
      console.log('Cannot create folder ', e);
   }

   return scriptPath;
};
