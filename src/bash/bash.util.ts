import { exec } from 'child_process';
import os from 'os';
import { buildPath } from '../util/path.util.js';

const bashProfile = '.bash_profile';

export const bashProfilePath = buildPath(os.homedir(), bashProfile);

const getOSUsername = () => {
   return os.userInfo().username;
};

function getEscapedUsername() {
   const username = getOSUsername();

   if (username.includes(' ')) {
      const splitted = username.split(' ');
      return splitted.join('\\ ');
   } else {
      return username;
   }
}

function getHomeDirWithEscapedUsername(path: string) {
   const username = getOSUsername();

   if (username.includes(' ')) {
      const quotedUsername = getEscapedUsername();
      return path.replace(username, quotedUsername);
   } else {
      return path;
   }
}

export const getInlineBashSourceScriptString = (pathToBash: string): string => {
   const dir = getHomeDirWithEscapedUsername(`${os.homedir()}/${pathToBash}`);
   const replacedCDir = dir.replace('C:\\', '');
   const replacedSlashes = replacedCDir.replace('\\', '/');

   return `bash -c "source ${'/mnt/c/' + replacedSlashes}"`;
};

export const reloadBashProfile = () => {
   exec(getInlineBashSourceScriptString(bashProfile), (error) => {
      if (error) {
         console.error('Error reloading bash profile:', error);
      } else {
         console.log('Bash profile reloaded successfully.');
      }
   });
};

export const getTildeCommandForOS = (os: string) => {
   if (os === 'win32') return '%USERPROFILE%';
   return '~';
};

export const getSourceCommandForOS = (os: string) => {
   if (os === 'win32') return 'call';
   return 'source';
};

export const getCatCommandForOS = (os: string) => {
   if (os === 'win32') return 'type';
   return 'cat';
};

export const getOpenFolderCommandForOS = (os: string) => {
   if (os === 'win32') return 'start';
   return 'open';
};

export const getShellCommandForOS = (os: string) => {
   if (os === 'win32') return 'cmd.exe';
   return '/bin/bash';
};
