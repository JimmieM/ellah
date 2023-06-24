import { promises as fs } from 'fs';
import path from 'path';

export const readFile = (filePath: string): Promise<string> => {
   return fs.readFile(filePath, 'utf8');
};

export const writeFile = (filePath: string, data: string): Promise<void> => {
   const dir = path.dirname(filePath);
   return fs
      .mkdir(dir, { recursive: true })
      .then(() => fs.writeFile(filePath, data, 'utf8'))
      .catch((err) => {
         console.error(`Error writing file at ${filePath}:`, err);
         throw err; // Re-throw the error to allow higher level handling
      });
};
