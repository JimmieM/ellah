import fs from 'fs';
import os from 'os';
import path from 'path';

const baseDir = path.join(os.homedir(), '.ellah-cli');
const syncPath = path.join(baseDir, '/synced');

export const syncFile = (
   entityPath: string,
   filePath: string,
   file: any,
): string => {
   const scriptPath = `${syncPath}/${entityPath}/${filePath}`;

   try {
      fs.mkdirSync(`${syncPath}/${entityPath}`, { recursive: true });
   } catch (e) {
      console.log('Cannot create folder ', e);
   }
   fs.writeFileSync(scriptPath, file);

   // Make the script executable
   fs.chmodSync(scriptPath, '755');

   return scriptPath;
};
