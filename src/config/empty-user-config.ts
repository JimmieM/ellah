import { UserConfig } from './user-config.model.js';

export const emptyUserConfig: UserConfig = {
   editor: {
      type: 'nano',
   },
   db: {
      user: '',
      database: '',
      password: '',
      port: 5432,
      host: '',
   },
   storage: {
      provider: null!,
      config: {
         bucket: {
            bucketName: '',
            region: '',
         },
         credentials: {
            accessKeyId: '',
            secretAccessKey: '',
         },
      },
   },
};
