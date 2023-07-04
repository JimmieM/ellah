import {
   createBaseEntityCommands,
   EntityCommands,
} from '../entity/base-commands.js';
import { hasStorageConfig } from '../entity/entity-config-helpers.js';

const createImageCommand = createBaseEntityCommands(
   'img',
   EntityCommands,
   [
      { command: 'ls' },
      { command: 'add' },
      { command: 'mv' },
      { command: 'open' },
      { command: 'rm' },
      { command: 'origin' },
   ],
   hasStorageConfig,
);

export const imageCommand = createImageCommand.cmd;
