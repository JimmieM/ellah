import { UserConfig } from '../config/user-config.model.js';

export const hasStorageConfig = (config: UserConfig) => {
   return (
      !!config.storage.provider &&
      !!config.storage.config.bucket.region &&
      !!config.storage.config.bucket.bucketName &&
      !!config.storage.config.credentials.accessKeyId &&
      !!config.storage.config.credentials.secretAccessKey
   );
};
