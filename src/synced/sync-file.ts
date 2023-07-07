import fs from 'fs';
import os from 'os';
import path from 'path';
import bucket from '../file-bucket/index.js';
import { readFile, writeFile } from '../util/file.util.js';
import { buildPath } from '../util/path.util.js';

const baseDir = path.join(os.homedir(), '.ellah-cli');
const syncPath = path.join(baseDir, '/synced');

export const syncFile = async (
   entityPath: string,
   filePath: string,
   file: any,
): Promise<string> => {
   const scriptPath = buildPath(syncPath, entityPath, filePath);

   try {
      fs.mkdirSync(buildPath(syncPath, entityPath), { recursive: true });
   } catch (e) {
      console.log('Cannot create folder ', e);
   }
   await writeFile(scriptPath, file);

   // Make the script executable
   fs.chmodSync(scriptPath, '755');

   return scriptPath;
};

export const getSyncedFile = async (
   entity: string,
   key: string,
): Promise<string | undefined> => {
   const scriptPath = buildPath(syncPath, entity, key);
   const file = await readFile(scriptPath);

   if (file) return file;

   const downloadedfile = await bucket.Get(buildPath(entity, key));
   if (downloadedfile.body) {
      await syncFile(entity, key, downloadedfile.body);
      return downloadedfile.body;
   }
};
