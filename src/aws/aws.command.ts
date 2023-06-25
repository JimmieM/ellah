import { Command } from 'commander';
import { createAccessKeys } from './iam/create-iam-access-key.js';
import { createIAMUser } from './iam/create-iam-user.js';
import {
   getAwsCredentialsByProfile,
   parseLocalAwsProfiles,
} from './iam/get-local-credential-config.js';
import { loadConfig, saveConfig, setConfig } from '../config/user-config.js';
import { UserConfig } from '../config/user-config.model.js';

export const awsCommand = new Command('aws');

export const iamCommand = new Command('iam');

export const bucketCommand = awsCommand.command('bucket');
export const credentialsCommand = awsCommand.command('credentials');

export const localAwsCredentials = awsCommand.command('profile');

export const setAwsCredentialsConfig = (
   config: UserConfig,
   profile: {
      secretAccessKey: string;
      accessKeyId: string;
   },
): UserConfig => {
   return {
      ...config,
      storage: {
         ...config.storage,
         config: {
            ...config.storage.config,
            credentials: {
               secretAccessKey: profile.secretAccessKey,
               accessKeyId: profile.accessKeyId,
            },
         },
      },
   };
};

iamCommand
   .command('create <userName>')
   .description('create an AWS IAM profile')
   .action(async (userName) => {
      try {
         const createdUserName = await createIAMUser(userName);

         console.log('IAM user created:', createdUserName);
      } catch (error) {
         console.error('Error creating IAM user:', error);
      }
   });

iamCommand
   .command('key-gen <userName> [options]')
   .option('--use', 'use new credetial')
   .description('create AWS IAM access keys profile')
   .action(async (userName, options) => {
      try {
         const createdKey = await createAccessKeys(userName);

         console.log('Access key created:', createdKey.UserName);

         if (options.use) {
            const newConf = setAwsCredentialsConfig(loadConfig(), {
               secretAccessKey: createdKey.SecretAccessKey,
               accessKeyId: createdKey.AccessKeyId,
            });

            saveConfig(newConf);

            console.log(
               "You're now using your new access key in Ellah.",
               createdKey.UserName,
            );
         }
      } catch (error) {
         console.error('Error creating IAM user:', error);
      }
   });

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

localAwsCredentials
   .command('ls')
   .description('list stored config in ~/.aws/credentials')
   .action(() => {
      const profiles = parseLocalAwsProfiles();
      console.table(profiles);
   });

localAwsCredentials
   .command('get <profileName>')
   .description('view credentials of profile name')
   .action((profileName) => {
      const profile = getAwsCredentialsByProfile(profileName);
      console.table(profile);
   });

localAwsCredentials
   .command('use <profileName>')
   .description('use credentials of profile name in your Ellah configuration')
   .action((profileName) => {
      const profile = getAwsCredentialsByProfile(profileName);

      if (!profile.accessKeyId || !profile.secretAccessKey) {
         console.warn(
            'accessKeyId or secreyAccessKey is empty. Cannot procceed.',
         );
         return;
      }

      try {
         const config = loadConfig();

         const modifiedConfig = setAwsCredentialsConfig(config, {
            accessKeyId: profile.accessKeyId!,
            secretAccessKey: profile.secretAccessKey!,
         });

         saveConfig(modifiedConfig);
         console.log(`You're now using ${profileName} keys with Ellah`);
      } catch (error) {
         console.warn(
            'Failed to use configuration from ~/.aws/credentials:',
            profileName,
         );
      }
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
