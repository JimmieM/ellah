import { Command } from 'commander';
import fs from 'fs';
import mime from 'mime-types';
import open from 'open';
import path from 'path';
import { getCatCommandForOS } from '../bash/bash.util.js';
import { executeBash } from '../bash/execute-bash.js';
import { copyToClipboard } from '../clipboard/copy-to-clipboard.js';
import { loadConfig } from '../config/user-config.js';
import { UserConfig } from '../config/user-config.model.js';
import { fileEditor } from '../editor/editor.js';
import filebucket from '../file-bucket/index.js';
import { getCurrentOS } from '../os/os.util.js';
import { executeScript } from '../script/execute-script.js';
import { spinnerSuccess, stopSpinner, updateSpinnerText } from '../spinner.js';
import { syncFile } from '../synced/sync-file.js';
import { writeTempFile } from '../temp/write-temp-file.js';
import { readFile, writeFile } from '../util/file.util.js';
import { buildPath } from '../util/path.util.js';
import { tempDir } from '../temp/temp-dir.js';
import { confirmPrompt } from '../input/confirm.prompt.js';

const readAndUpload = async <T>(
   cmd: CommandWithActions<T>,
   entity: string,
   file: {
      filePath: string;
      name?: string;
   },
   options: Record<string, string>,
) => {
   const fn = (
      fileContent: Buffer,
      filename: string,
      options: Record<string, string>,
   ) => ({ fileContent, filename, options });

   const pipeBeforeUpload = cmd.pipeBeforeUpload || fn;

   const fileBuffer = fs.readFileSync(file.filePath);

   const contentType = mime.contentType(file.filePath) as any;

   const fileName = file.name || path.basename(file.filePath);

   const { fileContent, filename } = pipeBeforeUpload(
      fileBuffer,
      fileName,
      options,
   );

   return filebucket.Upload({
      key: `${entity}/${filename}`,
      buffer: fileContent,
      contentType: contentType,
      filename: filename,
   });
};

type EntityCommandIds = keyof typeof EntityCommands;

interface EntityCommand {
   [key: string]: {
      identifiers: string[];
      args?: string;
      helperText?: string;
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
      args: '[path]',
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
   new: {
      identifiers: ['new', 'n'],
      args: '<file>',
   },
};

interface GeneralParamPipes {
   pipeFilePathParamAsync: (
      path: string,
      options?: Record<string, string>,
   ) => Promise<string>;
}

interface ListPipes<T> {
   pipeListItemDataAsync: (
      path: string,
      options: Record<string, string>,
   ) => Promise<T[]>;
   pipeListTableAsync: (
      items: T[],
      options: Record<string, string>,
   ) => Promise<Partial<T>[]>;
   pipeListTable: (items: T[], options: Record<string, string>) => Partial<T>[];
}

interface AddPipes {
   pipeBeforeUpload: (
      fileContent: Buffer,
      filename: string,
      options: Record<string, string>,
   ) => {
      fileContent: Buffer;
      filename: string;
      options: Record<string, string>;
   };
}

export interface CommandWithActions<T>
   extends Partial<AddPipes>,
      Partial<ListPipes<T>>,
      Partial<GeneralParamPipes> {
   command: EntityCommandIds;
   onSuccess?: () => Promise<void>;
   onFail?: (error: any) => Promise<void>;
}

const commandsIncludes = <T>(
   entity: EntityCommandIds,
   commands: CommandWithActions<T>[],
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

export const commandWithErrorHandlingAndMiddleware = <T>(
   cmd: Command,
   entity: string,
   entityCommands: EntityCommand,
   requiredConfig?: (config: UserConfig) => boolean,
) => {
   return async (cmdWithActions: CommandWithActions<T>, cb: any) => {
      throwIfRequiredConfigIsMissing(entity, requiredConfig, loadConfig);

      const commandArgs = entityCommands[cmdWithActions.command]?.args || '';

      const commandIdentifiers =
         entityCommands[cmdWithActions.command]?.identifiers;

      const commandOptions = entityCommands[cmdWithActions.command]?.options;

      commandIdentifiers.forEach((cmdId) => {
         createCommand(
            cmd,
            cmdId,
            commandArgs,
            commandOptions,
            cmdWithActions,
            cb,
         );
      });
   };
};

const createCommand = <T>(
   cmd: any,
   commandId: string,
   commandArgs: string,
   commandOptions:
      | {
           flags: string;
           description: string;
        }[]
      | undefined,
   cmdWithActions: CommandWithActions<T>,
   cb: any,
) => {
   const subCommand = cmd.command(`${commandId} ${commandArgs}`);

   if (commandOptions) {
      commandOptions.forEach((option) =>
         subCommand.option(option.flags, option.description),
      );
   }

   subCommand.action(async (...args: any) => {
      try {
         updateSpinnerText('Processing ...');

         console.log();

         await cb(...args);

         console.log();

         await cmdWithActions.onSuccess?.();

         spinnerSuccess();
      } catch (error) {
         console.warn(error);
         await cmdWithActions.onFail?.(error);
      } finally {
         stopSpinner();
      }
   });
};

const pipeFilePathAsyncOrDefault = async <T>(
   cmd: CommandWithActions<T>,
   file: string,
   options?: Record<string, string>,
) => {
   const filePath =
      (await cmd?.pipeFilePathParamAsync?.(file, options)) || file;

   if (!filePath) throw new Error('No filepath input');

   return filePath;
};

export const createBaseEntityCommands = <T>(
   entity: string,
   entityCommands: EntityCommand,
   commandsConfig: CommandWithActions<T>[],
   requiredConfig?: (config: UserConfig) => boolean,
) => {
   const entityCommand = new Command(entity);

   const bindCommand = commandWithErrorHandlingAndMiddleware<T>(
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
   const hasNew = commandsIncludes('new', commandsConfig);

   if (!!hasClip)
      bindCommand(hasClip, async (filePath: string) => {
         const tempFile = await writeTempFile(entity, filePath, filebucket);
         const content = await readFile(tempFile);
         copyToClipboard(content);
      });

   if (!!hasLs)
      bindCommand(
         hasLs,
         async (path: string, options: Record<string, string>) => {
            const hasAsyncDataPipe = await hasLs.pipeListItemDataAsync?.(
               path,
               options,
            );

            const listPath = path ? buildPath(entity, path) : entity;

            const fileBucketData = async () => {
               const objects = await filebucket.ListObjects(listPath);
               return objects.body.map((obj: any) => ({
                  key: obj.Key,
                  lastModified: obj.LastModified,
                  size: obj.Size,
                  storageClass: obj.StorageClass,
               }));
            };
            const table = hasAsyncDataPipe || (await fileBucketData());

            console.log();

            const pipedTable =
               hasLs.pipeListTable?.(table, options) ||
               (await hasLs.pipeListTableAsync?.(table, options)) ||
               table;

            console.table(pipedTable);
         },
      );

   if (!!hasRm)
      bindCommand(
         hasRm,
         async (file: string, options: Record<string, string>) => {
            stopSpinner();

            const filePath = await pipeFilePathAsyncOrDefault(
               hasRm,
               file,
               options,
            );

            const entityWithFilePath = `${entity}/${filePath}`;

            const awaitYesNo = await confirmPrompt(
               `Are you sure you want to remove ${entityWithFilePath}?`,
            );

            if (awaitYesNo) {
               const response = await filebucket.Delete(
                  `${entityWithFilePath}`,
               );
               console.warn(`Deleted ${entityWithFilePath}`);
               console.table(response);
               return;
            }

            console.warn('Aborted deletion.');
         },
      );

   if (!!hasCp)
      bindCommand(hasCp, async (file: string, destination: string) => {
         const filePath = await pipeFilePathAsyncOrDefault(hasCp, file);
         const response = await filebucket.Get(`${entity}/${filePath}`);

         if (!response.body) {
            console.warn(`${entity} not found ...`);

            return;
         }

         await writeFile(destination, response.body);
      });

   if (!!hasExec)
      bindCommand(hasExec, async (file: string, args: string) => {
         const scriptPath = await writeTempFile(
            entity,
            file,
            filebucket,
            process.cwd(),
         );

         const execute = await executeScript(scriptPath, args);

         console.table(execute);
      });

   if (!!hasEdit)
      bindCommand(hasEdit, async (scriptPath: string) => {
         const config = loadConfig();

         const tempScriptPath = buildPath(tempDir, scriptPath);

         const downloadRequest = await filebucket.Get(
            `            ${entity}/${scriptPath}`,
         );

         const downloadToBuffer = Buffer.from(downloadRequest.body);

         const temporaryFilePath = await fileEditor(
            tempScriptPath,
            downloadToBuffer,
            config.editor.type,
         );

         const res = await readAndUpload(
            hasEdit,
            entity,
            { filePath: temporaryFilePath },
            {},
         );

         if (res?.key || res?.body) console.log('Script saved successfully.');
      });

   if (!!hasOpen)
      bindCommand(hasOpen, async (filePath: string) => {
         const tempFile = await writeTempFile(entity, filePath, filebucket);

         await open(tempFile);
      });

   if (!!hasOrigin)
      bindCommand(hasOrigin, async (file: string) => {
         const filePath = await pipeFilePathAsyncOrDefault(hasOrigin, file);
         const response = await filebucket.GetDownloadUrl(
            `${entity}/${filePath}`,
         );

         if (!response) {
            console.warn('Link not available.');
            return;
         }

         console.log(`Opening ${file} ...`);

         await open(response);
      });

   if (!!hasMv)
      bindCommand(hasMv, async (file: string, fileDestination: string) => {
         const filePath = await pipeFilePathAsyncOrDefault(hasMv, file);
         const filePathDestination = pipeFilePathAsyncOrDefault(
            hasMv,
            fileDestination,
         );

         await filebucket.Copy(
            `${entity}/${filePathDestination}`,
            `${entity}/${filePath}`,
         );

         await filebucket.Delete(`${entity}/${filePath}`);
      });

   if (!!hasCat)
      bindCommand(hasCat, async (file: string) => {
         const filePath = await pipeFilePathAsyncOrDefault(hasCat, file);

         const response = await filebucket.Get(`${entity}/${filePath}`);

         if (!response.body) {
            console.warn('File not found ...');
            return;
         }

         const scriptPath = syncFile(entity, filePath, response.body);

         const resp = await executeBash(
            `${getCatCommandForOS(getCurrentOS())} "${scriptPath}"`,
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
            const res = await readAndUpload(
               hasAdd,
               entity,
               {
                  filePath: file,
                  name,
               },
               options,
            );

            console.table(res);
         },
      );

   if (!!hasNew)
      bindCommand(
         hasNew,
         async (name: string, options: Record<string, string>) => {
            const scriptPath = buildPath(tempDir, name);
            await writeFile(scriptPath, '');

            const config = loadConfig();

            const emptyContents = await readFile(scriptPath);

            const emptyToBuffer = Buffer.from(emptyContents);

            const tempSavePath = await fileEditor(
               scriptPath,
               emptyToBuffer,
               config.editor.type,
            );

            const uploadRes = await readAndUpload(
               hasNew,
               entity,
               {
                  filePath: tempSavePath,
                  name,
               },
               options,
            );

            console.table(uploadRes);
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
