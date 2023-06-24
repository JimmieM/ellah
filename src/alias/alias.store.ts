import fs from 'fs';
import os from 'os';
import path from 'path';

const baseDir = path.join(os.homedir(), '.ellah-cli');
const ellahAlias = path.join(baseDir, '/alias');

const getFile = (filename: string, idx: number) => {
   return new Promise((resolve, reject) => {
      fs.readFile(path.join(ellahAlias, filename), 'utf8', (err, data) => {
         if (err) {
            reject(err);
            return;
         }

         resolve({
            key: idx,
            file: data,
         });
      });
   });
};

export const getAliasFiles = () => {
   return new Promise((resolve, reject) => {
      fs.readdir(ellahAlias, (err, files) => {
         if (err) {
            reject(err);
            return;
         }
         const promises = files.map((filename, idx) => getFile(filename, idx));
         Promise.all(promises)
            .then((results) => resolve(results))
            .catch((error) => reject(error));
      });
   });
};
