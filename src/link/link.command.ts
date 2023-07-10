import open from 'open';
import {
   createBaseEntityCommands,
   EntityCommands,
} from '../entity/base-commands.js';
import { hasStorageConfig } from '../entity/entity-config-helpers.js';
import { toUrlWithPrefix } from '../util/url.util.js';
import { addLink } from './add-link.js';
import { getLinkByIndex } from './get-link-by-idx.js';
import { getLinkByName } from './get-link-by-name.js';
import { getLinkByUrlIncludes } from './get-link-by-url-includes.js';
import { getLinksByTags } from './get-links-by-tags.js';
import { getLinks } from './get-links.js';

const aliasEntityCommands = {
   ...EntityCommands,
   open: {
      ...EntityCommands.open,
      args: '[file]', // make standard param optional
      options: [
         {
            flags: '--name',
            description:
               'Open link by name. Example: ellah link open myName --name',
         },
      ],
   },
   ls: {
      ...EntityCommands.ls,
      options: [
         {
            flags: '--tags <values...>',
            description:
               'View links by tags. Example: ellah link ls --tags dev ci',
         },
      ],
   },
   add: {
      ...EntityCommands.add,
      options: [
         {
            flags: '--name <value>',
            description:
               'Add a name to your link. Example: ellah link add myName --name',
         },
         {
            flags: '--tags <values...>',
            description:
               'Add tags to your link. Example: ellah link add --name myName --tags dev ci',
         },
      ],
   },
};

const createLinkCommand = createBaseEntityCommands(
   'link',
   aliasEntityCommands,
   [
      {
         command: 'ls',
         pipeListItemDataAsync(options) {
            if (options.tags && options.tags.length > 0) {
               return getLinksByTags(options.tags);
            }

            return getLinks();
         },
      },
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
   async (link: string, options: Record<string, string>) => {
      const openLink = async (_link?: string) =>
         _link ? await open(toUrlWithPrefix(_link)) : null;
      if (options.name) {
         const linkObj = await getLinkByName(link);
         console.warn({ linkObj });

         if (!linkObj?.link) return await openLink(linkObj?.link);
      }

      const idxOptions = options.i || options.idx;

      if (idxOptions) {
         const linkObj = await getLinkByIndex(Number(link));
         return await openLink(linkObj?.link);
      }

      const linkObj = await getLinkByUrlIncludes(link);

      if (linkObj.length > 1) {
         console.warn('Found multilple links including name: ', link);
         console.log();
         console.table(linkObj);
         return;
      }

      if (linkObj.length === 1) {
         return await openLink(linkObj[0].link);
      }
   },
);

createLinkCommand.createSubCommand(
   {
      command: 'add',
   },
   async (link: string, _: any, options: Record<string, string | string[]>) => {
      await addLink({
         link,
         name: options.name as string,
         tags: options.tags as string[],
      });
   },
);

export const linkCommand = createLinkCommand.cmd;
