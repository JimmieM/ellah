import { S3StorageCredentials } from './storage-providers/s3.js';

export const StorageProvider = {
   s3: 's3',
};

export const EditorType = {
   VIM: 'vim',
   nano: 'nano',
};

export type StorageConfigUnion = S3StorageCredentials;

export interface DbCredentials {
   user: string;
   database: string;
   password: string;
   port: number;
   host: string;
}

export interface EditorSettings {
   type: keyof typeof EditorType;
}

export interface UserConfig {
   editor: EditorSettings;
   db: DbCredentials;
   storage: {
      provider: keyof typeof StorageProvider;
      config: StorageConfigUnion;
   };
}
