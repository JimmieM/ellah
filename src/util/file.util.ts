import { Dirent, promises as fs } from 'fs';
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

export const mkDir = async (dirPath: string) => {
   try {
      if (!(await fs.access(dirPath).catch(() => false))) {
         await fs.mkdir(dirPath, { recursive: true });
      }
   } catch (error) {
      console.error('Error creating directory:', error);
   }
};

export const removeFilesInDirRecursive = async (dir: string) => {
   try {
      const dirents: Dirent[] = await fs.readdir(dir, { withFileTypes: true });
      for (const dirent of dirents) {
         const filePath = path.join(dir, dirent.name);
         if (dirent.isFile()) {
            await fs.unlink(filePath);
            console.log('File deleted:', filePath);
         } else if (dirent.isDirectory()) {
            removeFilesInDirRecursive(filePath);
         }
      }
   } catch (err) {
      console.error('Error reading directory:', err);
   }
};
