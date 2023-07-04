import {
   createBaseEntityCommands,
   EntityCommands,
} from '../entity/base-commands.js';
import { hasStorageConfig } from '../entity/entity-config-helpers.js';
import { syncBashProfileWithAliasDir } from './sync-alias-bash-profile.js';
import { syncAliasDir } from './sync-alias-dir.js';

const syncAliasDirAndBashProfile = async () => {
   await syncAliasDir();
   await syncBashProfileWithAliasDir();
};

const aliasEntityCommands = {
   ...EntityCommands,
   add: {
      ...EntityCommands.add,
      options: [
         {
            flags: '--os <value>',
            description:
               'Set an OS where this alias is to be executed on. Default will allow all aliases to sync on your bash_profile.sh',
         },
      ],
   },
   sync: {
      identifiers: ['s', 'sync'],
      args: '',
   },
};

const availableOsKeys: Record<string, string[]> = {
   win: ['win32', 'msys', 'cygwin'],
   mac: ['darwin'],
   linux: ['linux-gnu'],
};

const createAliasCommand = createBaseEntityCommands(
   'alias',
   aliasEntityCommands,
   [
      { command: 'ls' },
      {
         command: 'add',
         onSuccess: syncAliasDirAndBashProfile,
         pipeBeforeUpload: (
            fileContent: Buffer,
            filename: string,
            options: Record<string, string>,
         ) => {
            if (options.os) {
               const keys = Object.keys(availableOsKeys);
               const matchedKey = keys.find((key) => key === options.os);
               if (!matchedKey)
                  throw new Error(
                     `No OS key named ${
                        options.os
                     } found. Available keys are: ${keys.join(', ')}`,
                  );

               const keyCommands = availableOsKeys[matchedKey];

               const updatedContent = `
               # Check the operating system
               if [[ ${keyCommands
                  .map(
                     (cmd, idx) =>
                        `"$OSTYPE" == "${cmd}"${idx === 0 ? '*' : ''}`,
                  )
                  .join(' || ')} ]]; then
                   ${fileContent}
               fi`;

               const extendedFilename = `${options.os}/${filename}`;

               return {
                  fileContent: Buffer.from(updatedContent),
                  options,
                  filename: extendedFilename,
               };
            }

            return { fileContent, options, filename };
         },
      },
      { command: 'edit', onSuccess: syncAliasDirAndBashProfile },
      { command: 'exec' },
      { command: 'mv', onSuccess: syncAliasDirAndBashProfile },
      { command: 'open' },
      { command: 'rm', onSuccess: syncAliasDirAndBashProfile },
      { command: 'cp', onSuccess: syncAliasDirAndBashProfile },
      { command: 'origin' },
      { command: 'clip' },
   ],
   hasStorageConfig,
);

createAliasCommand.createSubCommand({ command: 'sync' }, async () => {
   await syncAliasDirAndBashProfile();
});

export const aliasCommand = createAliasCommand.cmd;
