import { Command } from 'commander';
import { getTildeCommandForOS } from '../bash/bash.util.js';
import { loadConfig, saveConfig, setConfig } from '../config/user-config.js';
import { UserConfig } from '../config/user-config.model.js';
import { getCurrentOS } from '../os/os.util.js';
import { createBucket } from './bucket/create-bucket.js';
import { deleteBucket } from './bucket/delete-bucket.js';
import { getBuckets } from './bucket/get-buckets.js';
import { createAccessKeys } from './iam/create-iam-access-key.js';
import { createIAMUser } from './iam/create-iam-user.js';
import {
   getAwsCredentialsByProfile,
   parseLocalAwsProfiles,
} from './iam/get-local-credential-config.js';
import { listProfiles } from './iam/list-iam.js';

export const awsCommand = new Command('aws');

export const iamCommand = awsCommand.command('iam');
export const bucketCommand = awsCommand.command('bucket');
export const credentialsCommand = awsCommand.command('credentials');
export const localAwsCredentials = awsCommand.command('profile');

const throwIfRegionIsUndefined = (conf: UserConfig, region?: string): void => {
   const exist = !!(conf.storage.config.bucket.region || region);

   if (!exist)
      throw new Error(
         'AWS bucket region is not defined. You can define it by running: ellah aws bucket set region <region>',
      );
};

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
         provider: 's3',
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

export const setAwsBucketConfig = (
   config: UserConfig,
   bucket: {
      region?: string;
      bucketName: string;
   },
): UserConfig => {
   return {
      ...config,
      storage: {
         provider: 's3',
         config: {
            ...config.storage.config,
            bucket: {
               region: bucket.region || config.storage.config.bucket.region,
               bucketName: bucket.bucketName,
            },
         },
      },
   };
};

iamCommand
   .command('add <userName>')
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
   .command('ls')
   .description('list your IAM profiles')
   .action(async () => {
      try {
         const profiles = await listProfiles();

         console.table(profiles);
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

awsCommand
   .command('set <key> <value>')
   .description('set an AWS config key')
   .action((key, value) => {
      try {
         const config = loadConfig();

         const manipulatedConfig = setConfig(config, key, value, [
            ['bucketName', ['storage', 'config', 'bucket', 'bucketName']],
            ['region', ['storage', 'config', 'bucket', 'region']],
            [
               'accessKeyId',
               ['storage', 'config', 'credentials', 'accessKeyId'],
            ],
            [
               'secretAccessKey',
               ['storage', 'config', 'credentials', 'secretAccessKey'],
            ],
         ]);

         saveConfig(manipulatedConfig);
         console.warn(`Config key ${key} is now ${value}`);
      } catch (error) {
         console.warn(error);
      }
   });

localAwsCredentials
   .command('ls')
   .description(
      `list stored config in ${getTildeCommandForOS(
         getCurrentOS(),
      )}/.aws/credentials`,
   )
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
            `Failed to use configuration from ${getTildeCommandForOS(
               getCurrentOS(),
            )}/.aws/credentials:`,
            profileName,
         );
      }
   });

bucketCommand
   .command('ls')
   .option('--region <region>', 'Specify the region')
   .description('list your S3 buckets')
   .action(async (options) => {
      throwIfRegionIsUndefined(loadConfig(), options.region);

      const buckets = await getBuckets(options.region);

      console.table(buckets);
   });

bucketCommand
   .command('create <bucketName>')
   .option('--use', 'use the new bucket in your Ellah config')
   .option('--region <region>', 'Specify the region')
   .description('add a S3 buckets')
   .action(async (bucketName, options) => {
      try {
         throwIfRegionIsUndefined(loadConfig(), options.region);

         const bucket = await createBucket(bucketName, options.region);

         console.log(
            `Created bucket ${
               options.region ? `on region ${options.region}` : ''
            } ${bucket}`,
         );

         if (options.use) {
            const manipulatedConfig = setAwsBucketConfig(loadConfig(), {
               bucketName,
               region: options.region,
            });

            saveConfig(manipulatedConfig);

            console.log(
               `Ellah is now using ${bucket} with region ${options.region}`,
            );
         }
      } catch (error) {
         console.warn('Failed to add bucket: ', error);
      }
   });

bucketCommand
   .command('rm <bucketName>')
   .option('--region <region>', 'Specify the region')
   .description('add a S3 buckets')
   .action(async (bucketName, options) => {
      throwIfRegionIsUndefined(loadConfig(), options.region);

      await deleteBucket(bucketName, options.region);

      console.log('Deleted bucket ', bucketName);
   });
