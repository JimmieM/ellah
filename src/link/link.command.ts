import open from 'open';
import {
   createBaseEntityCommands,
   EntityCommands,
} from '../entity/base-commands.js';
import { hasStorageConfig } from '../entity/entity-config-helpers.js';
import { selectListPrompt } from '../input/select-list.prompt.js';
import { stopSpinner } from '../spinner.js';
import { toUrlWithPrefix } from '../util/url.util.js';
import { addLink } from './add-link.js';
import { getLinkByIndex } from './get-link-by-idx.js';
import { getLinkByName } from './get-link-by-name.js';
import { getLinkByUrlIncludes } from './get-link-by-url-includes.js';
import { getLinksByTags } from './get-links-by-tags.js';
import { getLinks } from './get-links.js';
import { Link } from './link.model.js';

const openLink = async (_link?: string) => {
   return _link ? await open(toUrlWithPrefix(_link)) : null;
};

const handleOpenLinkByMultipleChoices = async (
   inputLink: string,
   choices: Link[],
) => {
   const promptChoices = choices.map((link) => ({
      name: `${link.link} | ${link.tags?.join(', ')}`,
      value: link.link,
   }));

   console.warn('Found multiple links including name: ', inputLink);
   console.log();
   const answer = await selectListPrompt<string>(
      'Select a link to open',
      promptChoices,
   );

   if (answer) return await openLink(answer);
};

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
   clip: {
      ...EntityCommands.clip,
      options: [
         {
            flags: '--name',
            description:
               'Clip link by name. Example: ellah link ls --tags dev ci',
         },
      ],
   },
   rm: {
      ...EntityCommands.rm,
      options: [
         {
            flags: '--name',
            description:
               'Remove a link by its name. Example: ellah link rm myName --name',
         },
      ],
   },
   mv: {
      ...EntityCommands.mv,
      options: [
         {
            flags: '--name',
            description:
               'Move a link by its name. Example: ellah link rm myName --name',
         },
      ],
   },
   add: {
      ...EntityCommands.add,
      options: [
         {
            flags: '--name <value>',
            description:
               'Add a name to your link. Example: ellah link add https://mylink.com --name myName',
         },
         {
            flags: '--tags <values...>',
            description:
               'Add tags to your link. Example: ellah link add mylink.com --name myName --tags dev ci',
         },
      ],
   },
};

const getPromptSelectedLinkByCb = async (
   path: string,
   cb: (url: string) => Promise<Link[]>,
) => {
   const getLink = async () => {
      const foundLinks = await cb(path);
      if (foundLinks.length === 0) throw new Error('');

      if (foundLinks.length > 1) {
         stopSpinner();

         const selectedPath = await selectListPrompt(
            'Select link to remove',
            foundLinks.map((link) => ({
               name: `${link.link} | ${link.tags?.join(', ')}`,
               value: link.key,
            })),
         );

         return selectedPath;
      }

      return foundLinks[0].link;
   };

   const link = await getLink();

   let parts = link.split('/');
   parts.shift();

   return parts.join('/');
};

const pipeFilePathAsyncHelper = async (
   path: string,
   options?: Record<string, string>,
) => {
   if (options?.name) {
      return await getPromptSelectedLinkByCb(path, getLinkByName);
   }

   if (options?.url) {
      return await getPromptSelectedLinkByCb(path, getLinkByUrlIncludes);
   }
   return null!;
};

const createLinkCommand = createBaseEntityCommands<Link>(
   'link',
   aliasEntityCommands,
   [
      {
         command: 'ls',
         pipeListItemDataAsync(path: string, options) {
            if (options.tags && options.tags.length > 0) {
               return getLinksByTags(options.tags, path);
            }

            return getLinks(path);
         },
         pipeListTable: (items) => {
            return items.map(({ link, name, tags }) => ({ link, name, tags }));
         },
      },
      {
         command: 'mv',
         pipeFilePathParamAsync: async (path, options) => {
            return pipeFilePathAsyncHelper(path, options);
         },
      },
      {
         command: 'rm',
         pipeFilePathParamAsync: async (path, options) => {
            return pipeFilePathAsyncHelper(path, options);
         },
      },
      {
         command: 'origin',
         pipeFilePathParamAsync: async (path, options) => {
            return pipeFilePathAsyncHelper(path, options);
         },
      },
      {
         command: 'clip',
         pipeFilePathParamAsync: async (path, options) => {
            return pipeFilePathAsyncHelper(path, options);
         },
      },
   ],
   hasStorageConfig,
);

// @override open command
createLinkCommand.createSubCommand(
   {
      command: 'open',
   },
   async (link: string, options: Record<string, string>) => {
      if (options.name) {
         const linkObj = await getLinkByName(link);

         if (linkObj.length > 1) {
            return await handleOpenLinkByMultipleChoices(link, linkObj);
         }
         return await openLink(linkObj[0].link);
      }

      const idxOptions = options.i || options.idx;

      if (idxOptions) {
         const linkObj = await getLinkByIndex(Number(link));
         return await openLink(linkObj?.link);
      }

      const linkObj = await getLinkByUrlIncludes(link);

      if (linkObj.length > 1) {
         return await handleOpenLinkByMultipleChoices(link, linkObj);
      }

      if (linkObj.length === 1) {
         return await openLink(linkObj[0].link);
      }
   },
);

// @override add command
createLinkCommand.createSubCommand(
   {
      command: 'add',
   },
   async (
      path: string,
      link: any,
      options: Record<string, string | string[]>,
   ) => {
      await addLink({
         path,
         link,
         name: options.name as string,
         tags: options.tags as string[],
      });
   },
);

export const linkCommand = createLinkCommand.cmd;
