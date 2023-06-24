import { Command } from 'commander';
import fs from 'fs';
import mime from 'mime-types';
import open from 'open';
import path from 'path';
import { loadConfig } from '../config/user-config';
import { UserConfig } from '../config/user-config.model';
import { fileEditor } from '../editor/editor';
import filebucket from '../file-bucket';
import { executeScript, saveScriptToPath } from '../script/execute-script';
import { spinnerSuccess, stopSpinner, updateSpinnerText } from '../spinner';
import { writeFile } from '../util/file.util';

export enum EntityCommand {
   ls,
   rm,
   exec,
   open,
   edit,
   mv,
   add,
   cp,
}

export interface CommandWithActions {
   command: EntityCommand;
   onSuccess?: () => Promise<void>;
   onFail?: () => Promise<void>;
}

const commandsIncludes = (
   entity: EntityCommand,
   commands: CommandWithActions[],
) => {
   return commands.find((command) => command.command === entity);
};

export const baseEntityCommands = (
   entity: string,
   commands: CommandWithActions[],
   requiredConfig?: (config: UserConfig) => boolean,
): Command => {
   const entityCommand = new Command(entity);

   const throwIfRequiredConfigIsMissing = (
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

   const withErrorHandlingAndMiddleware = (command: any) => {
      return (name: string, ...args: any) => {
         const subCommand = command.command(name);

         throwIfRequiredConfigIsMissing(requiredConfig, loadConfig);

         return subCommand.action(...args);
      };
   };

   const bindCommand = withErrorHandlingAndMiddleware(entityCommand);

   const hasLs = commandsIncludes(EntityCommand.ls, commands);
   const hasRm = commandsIncludes(EntityCommand.rm, commands);
   const hasAdd = commandsIncludes(EntityCommand.add, commands);
   const hasEdit = commandsIncludes(EntityCommand.edit, commands);
   const hasCp = commandsIncludes(EntityCommand.cp, commands);
   const hasMv = commandsIncludes(EntityCommand.mv, commands);
   const hasOpen = commandsIncludes(EntityCommand.open, commands);
   const hasExec = commandsIncludes(EntityCommand.exec, commands);

   if (!!hasLs)
      entityCommand.command('ls').action(async () => {
         updateSpinnerText('Processing ...');

         const objects = await filebucket.ListObjects(entity);

         await hasLs?.onSuccess?.();
         spinnerSuccess();

         const table = objects.body.map((obj: any) => ({
            key: obj.Key,
            lastModified: obj.LastModified,
            size: obj.Size,
            storageClass: obj.StorageClass,
         }));

         console.table(table);
      });

   if (!!hasRm)
      entityCommand.command('rm <file>').action(async (file) => {
         updateSpinnerText(`Deleting file ${file} ...`);

         const response = await filebucket.Delete(`${entity}/${file}`);

         await hasRm?.onSuccess?.();

         spinnerSuccess();

         console.table(response);
      });

   if (!!hasCp)
      entityCommand
         .command('cp <file> <destination>')
         .action(async (file, destination) => {
            try {
               updateSpinnerText('Processing ...');

               throwIfRequiredConfigIsMissing(requiredConfig, loadConfig);

               const response = await filebucket.Get(`${entity}/${file}`);

               if (!response.body) {
                  console.warn(`${entity} not found ...`);

                  return;
               }

               await writeFile(destination, response.body);

               await hasCp?.onSuccess?.();

               console.log(`${entity} moved successfully ...`);
            } catch (error) {
               stopSpinner();
               console.warn(`Failed to move ${entity} ...`);
            }
         });

   if (!!hasExec)
      entityCommand
         .command('exec <file> [args...]')
         .action(async (file, args) => {
            updateSpinnerText('Processing ...');

            const response = await filebucket.Get(`${entity}/${file}`);

            if (!response.body) {
               console.warn('Script not found ...');
               return;
            }

            const scriptPath = saveScriptToPath(entity, file, response.body);

            const execute = await executeScript(scriptPath, args);

            spinnerSuccess();

            await hasExec?.onSuccess?.();
            console.table(execute);
         });

   if (!!hasEdit)
      entityCommand
         .command('edit <scriptPath>')
         .description('Edit a script')
         .action(async (scriptPath) => {
            const config = loadConfig();

            await fileEditor(scriptPath, entity, config.editor.type);

            await hasEdit?.onSuccess?.();
         });

   if (!!hasOpen)
      entityCommand.command('open <file>').action(async (file) => {
         updateSpinnerText('Processing ...');

         const response = await filebucket.GetDownloadUrl(`${entity}/${file}`);

         spinnerSuccess();

         if (!response) {
            console.warn('Link not available.');
            return;
         }

         console.log(`Opening ${file} ...`);

         await open(response);

         await hasOpen?.onSuccess?.();
      });

   if (!!hasMv)
      entityCommand
         .command('mv <filePath> <filePathDestination>')
         .action(async (filePath, filePathDestination) => {
            try {
               updateSpinnerText('Processing ...');

               await filebucket.Copy(
                  `${entity}/${filePathDestination}`,
                  `${entity}/${filePath}`,
               );

               await filebucket.Delete(`${entity}/${filePath}`);

               spinnerSuccess();

               await hasMv?.onSuccess?.();

               console.log('File copied successfully.');
            } catch (error) {
               stopSpinner();
               console.warn('Failed to copy script.');
            }
         });

   if (!!hasAdd)
      entityCommand.command('add <file> [name]').action(async (file, name) => {
         updateSpinnerText('Processing ...');

         const fileBuffer = fs.readFileSync(file);

         const contentType = mime.contentType(file) as any;

         const fileName = path.basename(file);

         const response = await filebucket.Upload({
            key: `${entity}/${fileName}`,
            buffer: fileBuffer,
            contentType: contentType,
            filename: name || file,
         });

         await hasAdd?.onSuccess?.();

         spinnerSuccess();

         console.table(response);
      });

   return entityCommand;
};
