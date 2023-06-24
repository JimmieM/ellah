import { exec } from 'child_process';
import os from 'os';
import path from 'path';

const bashProfile = '.bash_profile';

export const bashProfilePath = path.join(os.homedir(), bashProfile);

export const reloadBashProfile = () => {
   exec(`source ~/${bashProfile}`, (error) => {
      if (error) {
         console.error('Error reloading bash profile:', error);
      } else {
         console.log('Bash profile reloaded successfully.');
      }
   });
};
