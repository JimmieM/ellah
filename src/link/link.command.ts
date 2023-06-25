import open from 'open';
import {
   createBaseEntityCommands,
   EntityCommands,
} from '../entity/base-commands.js';
import { hasStorageConfig } from '../entity/entity-config-helpers.js';
import { toUrlWithPrefix } from '../util/url.util.js';
import { addLink } from './add-link.js';
import { getLinkByName } from './get-link-by-name.js';

const createLinkCommand = createBaseEntityCommands(
   'link',
   EntityCommands,
   [
      { command: 'ls' },
      { command: 'mv' },
      { command: 'rm' },
      { command: 'origin' },
   ],
   hasStorageConfig,
);

// @override open command
createLinkCommand.createSubCommand(
   {
      command: 'open',
   },
   async (name: string) => {
      const linkObj = await getLinkByName(name);

      await open(toUrlWithPrefix(linkObj.link));
   },
);

createLinkCommand.createSubCommand(
   {
      command: 'add',
   },
   async (link: string, name: string) => {
      await addLink({ link, name });
   },
);

export const linkCommand = createLinkCommand.cmd;
