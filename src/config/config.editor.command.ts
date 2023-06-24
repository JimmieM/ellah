import { configCommand } from './config.command';
import { loadConfig, saveConfig, setConfig } from './user-config';

export const editorCommand = configCommand.command('editor');

editorCommand
   .command('set <key> <value>')
   .description('set a edtiro config key')
   .action((key, value) => {
      const config = loadConfig();

      const manipulatedConfig = setConfig(config, key, value, [
         ['type', ['editor', 'type']],
      ]);

      saveConfig(manipulatedConfig);
   });
