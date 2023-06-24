import { DbCredentials } from '../user-config.model.js';

export const dbProviderTable = (config: DbCredentials | undefined) => {
   return Object.entries(config || []).map(([key, value]) => ({
      key,
      value,
   }));
};
