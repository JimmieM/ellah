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
   sync: {
      identifiers: ['s', 'sync'],
      args: '',
   },
};

const createAliasCommand = createBaseEntityCommands(
   'alias',
   aliasEntityCommands,
   [
      { command: 'ls' },
      { command: 'add', onSuccess: syncAliasDirAndBashProfile },
      { command: 'edit', onSuccess: syncAliasDirAndBashProfile },
      { command: 'exec' },
      { command: 'mv', onSuccess: syncAliasDirAndBashProfile },
      { command: 'open' },
      { command: 'rm', onSuccess: syncAliasDirAndBashProfile },
      { command: 'cp', onSuccess: syncAliasDirAndBashProfile },
   ],
   hasStorageConfig,
);

createAliasCommand.createSubCommand({ command: 'sync' }, async () => {
   await syncAliasDirAndBashProfile();
});

export const aliasCommand = createAliasCommand.cmd;
