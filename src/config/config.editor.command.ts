import { configCommand } from './config.command.js';
import { loadConfig, saveConfig, setConfig } from './user-config.js';

export const editorCommand = configCommand.command('editor');

editorCommand
   .command('set <key> <value>')
   .description('set a editor config key')
   .action((key, value) => {
      const config = loadConfig();

      const manipulatedConfig = setConfig(config, key, value, [
         ['type', ['editor', 'type']],
      ]);

      saveConfig(manipulatedConfig);
   });
