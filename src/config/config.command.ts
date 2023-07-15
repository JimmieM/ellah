import chalk from 'chalk';
import { Command } from 'commander';
import { exportConfig } from './export/export.config.js';
import { importConfig } from './import/import.config.js';
import { editorConfigTable } from './tables/editor-config.table.js';
import { storageProviderTable } from './tables/storage-provider.table.js';
import { loadConfig, saveConfig } from './user-config.js';
import { configExist } from './user-config.util.js';
import { confirmPrompt } from '../input/confirm.prompt.js';

export const configCommand = new Command('config');

configCommand.command('ls').action(async () => {
   const config = loadConfig();

   const storageTable = storageProviderTable(
      config?.storage.provider,
      config?.storage.config,
   );

   const editorTable = editorConfigTable(config.editor);

   console.log(chalk.blueBright.bgWhite.bold('Storage'));
   console.table(storageTable);

   console.log(chalk.blueBright.bgWhite.bold('Editor'));
   console.table(editorTable);
});

configCommand
   .command('set <key> <value>')
   .description('set a config key')
   .action((key, value) => {
      const config = loadConfig();

      switch (key) {
         case 'provider':
            config.storage.provider = value;
            break;
         case 'editor':
            config.editor.type = value;
            break;
      }

      saveConfig(config);
   });

configCommand.command('export <dir>').action(async function (dir) {
   try {
      await exportConfig(dir);
      console.log('Config file has been encrypted and saved.');
   } catch (error) {
      console.warn('Failed to export configuration file.');
   }
});

configCommand
   .command('import <filePath>')
   .description('Add a hashed config file')
   .action(async (filePath) => {
      try {
         const config = loadConfig();

         if (!configExist(config)) {
            await importConfig(filePath, saveConfig);
         }

         const awaitYesNo = await confirmPrompt(
            'You already have an active config. This will override your current config. Do you want to continue?',
         );

         if (awaitYesNo) {
            return await importConfig(filePath, saveConfig);
         }

         console.warn('Aborted import.');

         console.log('Configuration successfully imported');
      } catch (error) {
         console.warn(
            'Failed to import configuration. The password may be incorrect.',
         );
      }
   });
