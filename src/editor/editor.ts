import { spawnSync } from 'child_process';
import fs from 'fs';
import { Readable } from 'stream';
import { DEFAULT_EDITOR } from '../default/index.js';
import { checkIfCommandExistLocally } from '../bash/bash.util.js';
import { getCurrentOS } from '../os/os.util.js';

const getMyEditor = async (_editor: string) => {
   const editor = _editor || DEFAULT_EDITOR;

   const editorCanBeUsed = await checkIfCommandExistLocally(editor);
   if (!editorCanBeUsed) {
      const platform = getCurrentOS();

      if (platform === 'win32') {
         console.warn(
            'Opening editor using Notepad. If you wish to use VIM, you can change your config. ellah config set editor vi. If you wish to use nano, you can install it via Chocolatey.org then run: choco install -y nano',
         );

         return 'notepad';
      }
      return 'vi';
   }

   return editor;
};

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

         const myEditor = await getMyEditor(editor);

         const editProcess = spawnSync(myEditor, [temporaryFilePath], {
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
