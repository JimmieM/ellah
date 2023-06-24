import { loadConfig, setConfig, saveConfig } from './user-config.js';
import { configCommand } from './config.command.js';

export const awsCommand = configCommand.command('aws');

export const bucketCommand = awsCommand.command('bucket');
export const credentialsCommand = awsCommand.command('credentials');

credentialsCommand
   .command('set <key> <value>')
   .description('set a credential config key')
   .action((key, value) => {
      const config = loadConfig();

      const manipulatedConfig = setConfig(config, key, value, [
         ['accessKeyId', ['storage', 'config', 'credentials', 'accessKeyId']],
         [
            'secretAccessKey',
            ['storage', 'config', 'credentials', 'secretAccessKey'],
         ],
      ]);

      saveConfig(manipulatedConfig);
   });

bucketCommand
   .command('set <key> <value>')
   .description('set a bucket config key')
   .action((key, value) => {
      const config = loadConfig();

      const manipulatedConfig = setConfig(config, key, value, [
         ['bucketName', ['storage', 'config', 'bucket', 'bucketName']],
         ['region', ['storage', 'config', 'bucket', 'region']],
      ]);

      saveConfig(manipulatedConfig);
   });
