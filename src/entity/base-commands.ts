import { Command } from 'commander';
import fs from 'fs';
import mime from 'mime-types';
import open from 'open';
import os from 'os';
import path from 'path';
import { getCatCommandForOS } from '../bash/bash.util.js';
import { executeBash } from '../bash/execute-bash.js';
import { copyToClipboard } from '../clipboard/copy-to-clipboard.js';
import { loadConfig } from '../config/user-config.js';
import { UserConfig } from '../config/user-config.model.js';
import { fileEditor } from '../editor/editor.js';
import filebucket from '../file-bucket/index.js';
import { executeScript } from '../script/execute-script.js';
import { spinnerSuccess, stopSpinner, updateSpinnerText } from '../spinner.js';
import { syncFile } from '../synced/sync-file.js';
import { writeTempFile } from '../temp/write-temp-file.js';
import { readFile, writeFile } from '../util/file.util.js';

type EntityCommandIds = keyof typeof EntityCommands;

interface EntityCommand {
   [key: string]: {
      identifiers: string[];
      args?: string;
      options?: {
         flags: string;
         description: string;
      }[];
   };
}

export const EntityCommands: EntityCommand = {
   cat: {
      identifiers: ['cat'],
      args: '<file>',
   },
   ls: {
      identifiers: ['ls', 'list'],
      args: '',
   },
   rm: {
      identifiers: ['rm', 'del'],
      args: '<file>',
   },
   exec: {
      identifiers: ['exec', 'execute'],
      args: '<file> [args...]',
   },
   origin: {
      identifiers: ['origin', 'op'],
      args: '<file>',
   },
   open: {
      identifiers: ['open', 'op'],
      args: '<file>',
      options: [
         {
            flags: '--folder -f',
            description: 'Open folder of the file',
         },
      ],
   },
   edit: {
      identifiers: ['edit', 'e'],
      args: '<scriptPath>',
   },
   mv: {
      identifiers: ['mv', 'move'],
      args: '<filePath> <filePathDestination>',
   },
   add: {
      identifiers: ['add'],
      args: '<file> [name]',
   },
   cp: {
      identifiers: ['cp', 'copy'],
      args: '<file> <destination>',
   },
   clip: {
      identifiers: ['clip'],
      args: '<file>',
   },
};

export interface CommandWithActions {
   command: EntityCommandIds;
   onSuccess?: () => Promise<void>;
   onFail?: (error: any) => Promise<void>;
   pipeBeforeUpload?: (
      fileContent: Buffer,
      filename: string,
      options: Record<string, string>,
   ) => {
      fileContent: Buffer;
      filename: string;
      options: Record<string, string>;
   };
}

const commandsIncludes = (
   entity: EntityCommandIds,
   commands: CommandWithActions[],
) => {
   return commands.find((command) => command.command === entity);
};

const throwIfRequiredConfigIsMissing = (
   entity: string,
   requiredConfig: ((config: UserConfig) => boolean) | undefined,
   loadConfig: () => UserConfig,
) => {
   if (!requiredConfig) return;

   const config = loadConfig();
   const hasRequiredConfig = requiredConfig(config);

   if (!hasRequiredConfig)
      throw new Error(
         `Missing configuration for ${entity}. In order to use most entities, you're required to set a file provider such as Amazon S3.`,
      );
};

export const commandWithErrorHandlingAndMiddleware = (
   cmd: Command,
   entity: string,
   entityCommands: EntityCommand,
   requiredConfig?: (config: UserConfig) => boolean,
) => {
   return async (cmdWithActions: CommandWithActions, cb: any) => {
      const commandArgs = entityCommands[cmdWithActions.command].args;
      const commandIdentifiers =
         entityCommands[cmdWithActions.command].identifiers;
      const commandOptions = entityCommands[cmdWithActions.command].options;

      const subCommand = cmd.command(`${commandIdentifiers[0]} ${commandArgs}`);

      if (commandOptions) {
         commandOptions.forEach((option) =>
            subCommand.option(option.flags, option.description),
         );
      }

      commandIdentifiers.slice(1).forEach((alias) => {
         subCommand.alias(alias + ' ' + commandArgs);
      });

      subCommand.action(async (...args) => {
         try {
            throwIfRequiredConfigIsMissing(entity, requiredConfig, loadConfig);

            updateSpinnerText('Processing ...');

            console.log();

            await cb(...args);

            console.log();

            await cmdWithActions.onSuccess?.();

            spinnerSuccess();
         } catch (error) {
            stopSpinner();

            console.warn(error);

            await cmdWithActions.onFail?.(error);
         }
      });
   };
};

export const createBaseEntityCommands = (
   entity: string,
   entityCommands: EntityCommand,
   commandsConfig: CommandWithActions[],
   requiredConfig?: (config: UserConfig) => boolean,
) => {
   const entityCommand = new Command(entity);

   const bindCommand = commandWithErrorHandlingAndMiddleware(
      entityCommand,
      entity,
      entityCommands,
      requiredConfig,
   );

   const hasLs = commandsIncludes('ls', commandsConfig);
   const hasRm = commandsIncludes('rm', commandsConfig);
   const hasAdd = commandsIncludes('add', commandsConfig);
   const hasEdit = commandsIncludes('edit', commandsConfig);
   const hasCp = commandsIncludes('cp', commandsConfig);
   const hasMv = commandsIncludes('mv', commandsConfig);
   const hasOpen = commandsIncludes('open', commandsConfig);
   const hasOrigin = commandsIncludes('origin', commandsConfig);
   const hasExec = commandsIncludes('exec', commandsConfig);
   const hasCat = commandsIncludes('cat', commandsConfig);
   const hasClip = commandsIncludes('clip', commandsConfig);

   if (!!hasClip)
      bindCommand(hasClip, async (filePath: string) => {
         const tempFile = await writeTempFile(entity, filePath, filebucket);
         const content = await readFile(tempFile);
         copyToClipboard(content);
      });

   if (!!hasLs)
      bindCommand(hasLs, async () => {
         const objects = await filebucket.ListObjects(entity);
         const table = objects.body.map((obj: any) => ({
            key: obj.Key,
            lastModified: obj.LastModified,
            size: obj.Size,
            storageClass: obj.StorageClass,
         }));
         console.log();

         console.table(table);
      });

   if (!!hasRm)
      bindCommand(hasRm, async (file: string) => {
         const response = await filebucket.Delete(`${entity}/${file}`);
         console.table(response);
      });

   if (!!hasCp)
      bindCommand(hasCp, async (file: string, destination: string) => {
         const response = await filebucket.Get(`${entity}/${file}`);

         if (!response.body) {
            console.warn(`${entity} not found ...`);

            return;
         }

         await writeFile(destination, response.body);
      });

   if (!!hasExec)
      bindCommand(hasExec, async (file: string, args: string) => {
         const response = await filebucket.Get(`${entity}/${file}`);

         if (!response.body) {
            console.warn('Script not found ...');
            return;
         }

         const scriptPath = syncFile(entity, file, response.body);

         const execute = await executeScript(scriptPath, args);

         console.table(execute);
      });

   if (!!hasEdit)
      bindCommand(hasEdit, async (scriptPath: string) => {
         const config = loadConfig();

         await fileEditor(scriptPath, entity, config.editor.type);
      });

   if (!!hasOpen)
      bindCommand(hasOpen, async (filePath: string) => {
         const tempFile = await writeTempFile(entity, filePath, filebucket);

         await open(tempFile);
      });

   if (!!hasOrigin)
      bindCommand(hasOrigin, async (file: string) => {
         const response = await filebucket.GetDownloadUrl(`${entity}/${file}`);

         if (!response) {
            console.warn('Link not available.');
            return;
         }

         console.log(`Opening ${file} ...`);

         await open(response);
      });

   if (!!hasMv)
      bindCommand(
         hasMv,
         async (filePath: string, filePathDestination: string) => {
            await filebucket.Copy(
               `${entity}/${filePathDestination}`,
               `${entity}/${filePath}`,
            );

            await filebucket.Delete(`${entity}/${filePath}`);
         },
      );

   if (!!hasCat)
      bindCommand(hasCat, async (filePath: string) => {
         const response = await filebucket.Get(`${entity}/${filePath}`);

         if (!response.body) {
            console.warn('File not found ...');
            return;
         }

         const scriptPath = syncFile(entity, filePath, response.body);

         const resp = await executeBash(
            `${getCatCommandForOS(os.platform())} "${scriptPath}"`,
         );

         console.log(resp.output);

         if (resp.error) {
            console.warn(resp.error);
         }
      });

   if (!!hasAdd)
      bindCommand(
         hasAdd,
         async (
            file: string,
            name: string,
            options: Record<string, string>,
         ) => {
            const fn = (
               fileContent: Buffer,
               filename: string,
               options: Record<string, string>,
            ) => ({ fileContent, filename, options });

            const pipeBeforeUpload = hasAdd.pipeBeforeUpload || fn;

            const fileBuffer = fs.readFileSync(file);

            const contentType = mime.contentType(file) as any;

            const fileName = path.basename(file);

            const { fileContent } = pipeBeforeUpload(
               fileBuffer,
               fileName,
               options,
            );

            const response = await filebucket.Upload({
               key: `${entity}/${fileName}`,
               buffer: fileContent,
               contentType: contentType,
               filename: name || file,
            });

            console.table(response);
         },
      );

   return {
      createSubCommand: commandWithErrorHandlingAndMiddleware(
         entityCommand,
         entity,
         entityCommands,
         requiredConfig,
      ),
      cmd: entityCommand,
   };
};
