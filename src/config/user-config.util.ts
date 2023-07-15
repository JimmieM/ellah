import { UserConfig } from './user-config.model';

export const configExist = (config: UserConfig) => {
   return (
      !!config.storage.provider &&
      config.storage.config.bucket.bucketName !== ''
   );
};
