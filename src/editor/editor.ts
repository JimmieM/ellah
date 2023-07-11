import { spawnSync } from 'child_process';
import fs from 'fs';
import { Readable } from 'stream';
import { DEFAULT_EDITOR } from '../default/index.js';

export const fileEditor = async (
   scriptPath: string,
   buffer: Buffer,
   _editor?: string,
): Promise<string> => {
   return new Promise(async (resolve, reject) => {
      const editor = _editor || DEFAULT_EDITOR;

      const temporaryFilePath = scriptPath;

      const fileWriteStream = fs.createWriteStream(temporaryFilePath);

      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null); // Signal that stream end is reached

      bufferStream.pipe(fileWriteStream);

      fileWriteStream.on('error', (err) => {
         console.error('Error saving file:', err);
      });

      fileWriteStream.on('finish', async () => {
         console.log('File saved successfully!');
         const editProcess = spawnSync(editor, [temporaryFilePath], {
            stdio: 'inherit',
         });

         if (editProcess.status === 0) {
            console.log('Script edited successfully!');
            resolve(temporaryFilePath);
         } else {
            console.error('Error editing script!');
            reject(editProcess.error);
         }
      });
   });
};
