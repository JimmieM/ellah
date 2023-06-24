import { StorageConfigUnion, StorageProvider } from '../user-config.model.js';

export const storageProviderTable = (
   provider: string | undefined,
   config: StorageConfigUnion | undefined,
) => {
   const items = [{ key: 'storage provider', value: provider }];

   if (provider === StorageProvider.s3) {
      const bucketItems = Object.entries(config?.bucket || []).map(
         ([key, value]) => ({
            key,
            value,
         }),
      );
      items.push(...bucketItems);

      const credentialItems = Object.entries(config?.credentials || []).map(
         ([key, value]) => ({
            key,
            value,
         }),
      );
      items.push(...credentialItems);
   }

   return items;
};
