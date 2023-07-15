import {
   createBaseEntityCommands,
   EntityCommands,
} from '../entity/base-commands.js';
import { hasStorageConfig } from '../entity/entity-config-helpers.js';

const createScriptCommand = createBaseEntityCommands(
   'script',
   EntityCommands,
   [
      { command: 'ls' },
      { command: 'add' },
      { command: 'edit' },
      { command: 'exec' },
      { command: 'mv' },
      { command: 'open' },
      { command: 'rm' },
      { command: 'cp' },
      { command: 'cat' },
      { command: 'origin' },
      { command: 'clip' },
   ],
   hasStorageConfig,
);

export const scriptCommand = createScriptCommand.cmd;
