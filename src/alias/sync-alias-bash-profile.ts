import os from 'os';
import path from 'path';
import fs from 'fs';
import { bashProfilePath, reloadBashProfile } from '../bash/bash.util.js';

const baseDir = path.join(os.homedir(), '.ellah-cli');

const ellahAliasFile = 'alias.sh';

const ellahAlias = path.join(baseDir, '/alias');

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

   const files = fs.readdirSync(ellahAlias);

   if (!files || files?.length === 0) {
      console.log('No alias files to add to bash_profile.');
      return;
   }

   const linesToAdd = files
      .map((file) => `source ${ellahAlias}/${file}`)
      .join('\n');

   fs.readFile(bashProfilePath, 'utf8', (err, data) => {
      if (err) {
         console.error('Error reading bash profile:', err);
         return;
      }

      const startMarker =
         ": <<'EOF'\n--- ELLAH START (do not add lines between start and end as these will be overriden. Instead use the CLI. ellah alias --help) ---";
      const endMarker = '--- ELLAH END ---\nEOF';

      let startIndex = data.indexOf(startMarker);
      let endIndex = data.indexOf(endMarker);

      // If markers do not exist, add them at the end of the file
      if (startIndex === -1 || endIndex === -1) {
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
            reloadBashProfile();
         }
      });
   });
};
