import { getTemporaryFilePath } from './filepath';
import filebucket from '../file-bucket';
import fs from 'fs';
import { spawnSync } from 'child_process';
import mime from 'mime-types';
import path from 'path';
import { DEFAULT_EDITOR } from '../default';

export const fileEditor = async (
   scriptPath: string,
   entityType: string,
   _editor?: string,
) => {
   const editor = _editor || DEFAULT_EDITOR;

   const temporaryFilePath = getTemporaryFilePath(entityType, scriptPath);

   const downloadRequest = await filebucket.GetWithReadStream(
      path.join(entityType, scriptPath),
   );

   const fileWriteStream = fs.createWriteStream(temporaryFilePath);

   downloadRequest.createReadStream().pipe(fileWriteStream);

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

         const fileBuffer = fs.readFileSync(temporaryFilePath);

         const contentType = mime.contentType(scriptPath) as any;

         const fileName = path.basename(scriptPath);

         const res = await filebucket.Upload({
            key: `${entityType}/${fileName}`,
            buffer: fileBuffer,
            contentType: contentType,
            filename: scriptPath,
         });

         if (res.body) console.log('Script saved successfully.');
      } else {
         console.error('Error editing script!');
      }
   });
};
