import { DbCredentials } from '../user-config.model';

export const dbProviderTable = (config: DbCredentials | undefined) => {
   return Object.entries(config || []).map(([key, value]) => ({
      key,
      value,
   }));
};
