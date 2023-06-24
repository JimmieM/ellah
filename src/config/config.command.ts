import chalk from 'chalk';
import { Command } from 'commander';
import { exportConfig } from './export/export.config';
import { importConfig } from './import/import.config';
import { dbProviderTable } from './tables/db-provider.table';
import { editorConfigTable } from './tables/editor-config.table';
import { storageProviderTable } from './tables/storage-provider.table';
import { loadConfig, saveConfig } from './user-config';

export const configCommand = new Command('config');

configCommand.command('ls').action(async () => {
   const config = loadConfig();

   const dbTable = dbProviderTable(config.db);
   const storageTable = storageProviderTable(
      config?.storage.provider,
      config?.storage.config,
   );

   const editorTable = editorConfigTable(config.editor);

   console.log(chalk.blueBright.bgWhite.bold('Storage'));
   console.table(storageTable);

   console.log(chalk.blueBright.bgWhite.bold('DB'));
   console.table(dbTable);

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
         default:
            break;
      }

      saveConfig(config);
   });

configCommand.command('export <dir>').action(async function (dir) {
   await exportConfig(dir);

   console.log('Config file has been encrypted and saved.');
});

configCommand
   .command('import <filePath>')
   .description('Add a hashed config file')
   .action(async (filePath) => {
      try {
         await importConfig(filePath);
         console.log('Configuration successfully imported');
      } catch (error) {
         console.warn(
            'Failed to import configuration. The password may be incorrect.',
         );
      }
   });
