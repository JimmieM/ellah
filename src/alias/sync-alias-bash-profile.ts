import fs, { Dirent } from 'fs';
import os from 'os';
import path from 'path';
import {
   bashProfilePath,
   getBashSourceScriptForOS,
   reloadBashProfile,
} from '../bash/bash.util.js';
import { getCurrentOS } from '../os/os.util.js';

const ellahCliDir = '.ellah-cli';

const baseDir = path.join(os.homedir(), ellahCliDir);

const ellahAliasFile = 'alias.sh';

const ellahAlias = path.join(baseDir, '/alias');

const escapeRegExp = (str: string) => {
   return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const replaceAll = (str: string, find: string, replace: string): string => {
   return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
};

const drillFilesInDir = (dirPath: string): string[] => {
   const entries: Dirent[] = fs.readdirSync(dirPath, { withFileTypes: true });

   const filePaths: string[] = entries.flatMap((entry: Dirent) => {
      const fullPath: string = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
         return drillFilesInDir(fullPath);
      } else {
         return fullPath;
      }
   });

   return filePaths;
};

export const syncBashProfileWithAliasDir = () => {
   // Create the ellah-alias directory if it does not exist
   if (!fs.existsSync(ellahAlias)) {
      fs.mkdirSync(ellahAlias, { recursive: true });
      fs.writeFileSync(
         `${ellahAlias}/${ellahAliasFile}`,
         `alias ellahAwesome='echo Hello World!'`,
         'utf8',
      );
   }

   const files = drillFilesInDir(ellahAlias);

   if (!files || files?.length === 0) {
      console.log('No alias files to add to bash_profile.');
      return;
   }

   const filesWithRelativePaths = files.map((file) => {
      return replaceAll(replaceAll(file, ellahAlias, ''), '//', '/');
   });

   const currentOs = getCurrentOS();

   const linesToAdd = filesWithRelativePaths
      .map((file) => {
         const inlineBashScript = getBashSourceScriptForOS(
            currentOs,
            `${ellahCliDir}/alias/${file}`,
         );

         return inlineBashScript;
      })
      .join('\n');

   fs.readFile(bashProfilePath, 'utf8', (err, data) => {
      if (err) {
         console.error('Error reading bash profile:', err);
         return;
      }

      const startMarker = '# --- ELLAH START ---';
      const endMarker = '# --- ELLAH END ---';

      let startIndex = data.indexOf(startMarker);
      let endIndex = data.indexOf(endMarker);

      // If markers do not exist, add them at the end of the file
      if (startIndex === -1 && endIndex === -1) {
         data = `${data}\n${startMarker}\n${endMarker}\n`;
         startIndex = data.indexOf(startMarker);
         endIndex = data.indexOf(endMarker);
      }

      const before = data.substring(0, startIndex + startMarker.length);
      const after = data.substring(endIndex);
      const newData = `${before}\n${linesToAdd}\n${after}`;

      fs.writeFile(bashProfilePath, newData, (writeErr) => {
         if (writeErr) {
            console.error('Error writing to bash profile:', writeErr);
         } else {
            console.log('Bash profile updated successfully.');
            reloadBashProfile(currentOs);
         }
      });
   });
};
