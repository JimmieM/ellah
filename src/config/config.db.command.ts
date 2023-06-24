import { configCommand } from './config.command.js';
import { loadConfig, setConfig, saveConfig } from './user-config.js';

export const dbCommand = configCommand.command('db');

dbCommand
   .command('set <key> <value>')
   .description('set a database config key')
   .action((key, value) => {
      const config = loadConfig();

      const manipulatedConfig = setConfig(config, key, value, [
         ['user', ['db', 'user']],
         ['database', ['db', 'database']],
         ['password', ['db', 'password']],
         ['port', ['db', 'port']],
         ['host', ['db', 'host']],
      ]);

      saveConfig(manipulatedConfig);
   });
