import { exec } from 'child_process';
import os from 'os';
import { getOSUsername } from '../os/os.util.js';
import { buildPath } from '../util/path.util.js';

const bashProfile = '.bash_profile';

export const bashProfilePath = buildPath(os.homedir(), bashProfile);

const getEscapedUsername = () => {
   const username = getOSUsername();

   if (username.includes(' ')) {
      const splitted = username.split(' ');
      return splitted.join('\\ ');
   } else {
      return username;
   }
};

const getHomeDirWithEscapedUsername = (path: string) => {
   const username = getOSUsername();

   if (username.includes(' ')) {
      const quotedUsername = getEscapedUsername();
      return path.replace(username, quotedUsername);
   } else {
      return path;
   }
};

const getInlineBashSourceScriptString = (pathToBash: string): string => {
   const dir = getHomeDirWithEscapedUsername(`${os.homedir()}/${pathToBash}`);
   const replacedCDir = dir.replace('C:\\', '');
   const replacedSlashes = replacedCDir.replace('\\', '/');

   return `bash -c "source ${'/mnt/c/' + replacedSlashes}"`;
};

export const checkIfCommandExistLocally = (
   command: string,
): Promise<boolean> => {
   return new Promise((resolve) => {
      const platform = process.platform;
      const cmd = platform === 'win32' ? 'where' : 'which';
      exec(`${cmd} ${command}`, (error) => {
         resolve(!error);
      });
   });
};

export const getBashSourceScriptForOS = (
   platform: string,
   pathToBash: string,
) => {
   if (platform === 'win32') return getInlineBashSourceScriptString(pathToBash);

   const dir = getHomeDirWithEscapedUsername(`${os.homedir()}/${pathToBash}`);
   return `source ${dir};`;
};

export const reloadBashProfile = (platform: string) => {
   exec(getBashSourceScriptForOS(platform, bashProfile), (error) => {
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

export const getCatCommandForOS = (os: string) => {
   if (os === 'win32') return 'type';
   return 'cat';
};

export const getShellCommandForOS = (os: string) => {
   if (os === 'win32') return 'cmd.exe';
   return '/bin/bash';
};
