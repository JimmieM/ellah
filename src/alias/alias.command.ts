import {
   createBaseEntityCommands,
   EntityCommands,
} from '../entity/base-commands.js';
import { hasStorageConfig } from '../entity/entity-config-helpers.js';
import { syncBashProfileWithAliasDir } from './sync-alias-bash-profile.js';
import { syncAliasDir } from './sync-alias-dir.js';

const syncAliasDirAndBashProfile = async () => {
   await syncAliasDir();
   syncBashProfileWithAliasDir();
};

const aliasEntityCommands = {
   ...EntityCommands,
   ls: {
      ...EntityCommands.ls,
      options: [
         {
            flags: '--os <value>',
            description:
               'View your aliases by OS. Default will show all aliases synced your bash_profile.sh',
         },
      ],
   },
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
   new: {
      ...EntityCommands.new,
      options: [
         {
            flags: '--os <value>',
            description:
               'View your aliases by OS. Default will show all aliases synced your bash_profile.sh',
         },
      ],
   },
};

const availableOsKeys: Record<string, string[]> = {
   win: ['win32', 'msys', 'cygwin'],
   unix: ['darwin', 'linux-gnu'],
};

const getAliasOS = (item: any): string => {
   const count = (item.key.match(/\//g) || []).length;

   const os =
      count > 1
         ? item.key.split('/')[1] // ./alias is at 0.
         : 'SHARED';

   return os;
};

const pipeBeforeUploadHelper = (
   fileContent: Buffer,
   filename: string,
   options: Record<string, string>,
) => {
   if (options.os) {
      const keys = Object.keys(availableOsKeys);
      const matchedKey = keys.find((key) => key === options.os)!;

      const keyCommands = availableOsKeys[matchedKey];

      const updatedContent = `
      # Check the operating system
      if [[ ${keyCommands
         .map((cmd, idx) => `"$OSTYPE" == "${cmd}"${idx === 0 ? '*' : ''}`)
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
};

const createAliasCommand = createBaseEntityCommands<any>(
   'alias',
   aliasEntityCommands,
   [
      {
         command: 'ls',
         pipeListTable: (items, options) => {
            const tableWithOs = items.map((item) => {
               const os = getAliasOS(item);

               return {
                  ...item,
                  os,
               };
            }) as any[];

            if (options.os)
               return tableWithOs?.filter(
                  (e) => e?.os?.toLowercase() === options.os.toLowerCase(),
               );

            return tableWithOs;
         },
      },
      {
         command: 'add',
         onSuccess: syncAliasDirAndBashProfile,
         pipeBeforeUpload: (
            fileContent: Buffer,
            filename: string,
            options: Record<string, string>,
         ) => {
            return pipeBeforeUploadHelper(fileContent, filename, options);
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
      {
         command: 'new',
         onSuccess: syncAliasDirAndBashProfile,
         pipeBeforeUpload: (
            fileContent: Buffer,
            filename: string,
            options: Record<string, string>,
         ) => {
            return pipeBeforeUploadHelper(fileContent, filename, options);
         },
      },
   ],
   hasStorageConfig,
);

createAliasCommand.createSubCommand({ command: 'sync' }, async () => {
   await syncAliasDirAndBashProfile();
});

export const aliasCommand = createAliasCommand.cmd;
