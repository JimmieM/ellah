import { EllahFile } from '../models/file.model.js';

export interface IFileBucketProvider {
   config: IFileBucketConfig;
   getSignedUrl(
      type: 'putObject' | 'getObject',
      params:
         | {
              Bucket: string;
              Key: string;
              Body: string;
           }
         | any,
      callback: any,
   ): any;
   listObjectsV2(params: any, callback: any): any;
   getObject(
      params: { Bucket: string; Key: string } | any,
      callback?: any,
   ): any;
   upload(
      params:
         | {
              Bucket: string;
              Key: string;
              Body: string;
           }
         | any,
      callback: any,
   ): any;
   deleteObject(
      params: { Bucket: string; Key: string } | any,
      callback: any,
   ): any;
   copyObject(
      copyParams: {
         Bucket?: string;
         CopySource: string;
         Key: string;
      },
      callback: any,
   ): any;
}

export type BucketAccess = {
   username: string;
   password: string;
};

export interface IFileBucketConfig {
   bucketName: string;
   region: string;
   access: BucketAccess;
}

export interface IFileBucketResponse {
   location?: string;
   bucket?: string;
   key?: string;
   body?: Buffer | Uint8Array | Blob | string | any;
   commonPrefixes?: any;
}

export interface ISourceFunctions {}

export interface IFileBucket {
   provider: IFileBucketProvider;
   Get(key: string): Promise<IFileBucketResponse>;
   GetWithReadStream(key: string): any;
   Upload(file: EllahFile): Promise<IFileBucketResponse>;
   Delete(key: string): Promise<IFileBucketResponse>;
   GetDownloadUrl(key: string): Promise<string>;
   Copy(key: string, copySource: string, bucket?: string): Promise<void>;
   ListObjects(prefix?: string): Promise<IFileBucketResponse>;
}

export class FileBucket implements IFileBucket {
   provider: IFileBucketProvider;

   constructor(provider: IFileBucketProvider) {
      this.provider = provider;
   }

   GetWithReadStream(key: string) {
      return this.provider.getObject({
         Bucket: this.provider.config.bucketName,
         Key: key,
      });
   }

   GetDownloadUrl(key: string): Promise<string> {
      return new Promise((res, rej) =>
         this.provider.getSignedUrl(
            'getObject',
            {
               Bucket: this.provider.config.bucketName,
               Key: key,
               Expires: 600,
            },
            (err: Error, url: string) => {
               if (err) return rej(err);

               if (url) return res(url);

               return rej('Data has no body');
            },
         ),
      );
   }

   Get(key: string): Promise<IFileBucketResponse> {
      return new Promise((res, rej) =>
         this.provider.getObject(
            { Bucket: this.provider.config.bucketName, Key: key },
            (err: Error, data: any) => {
               if (err) return rej(err);

               if (data?.Body) {
                  return res({ body: data.Body });
               } else {
                  return rej('Data has no body');
               }
            },
         ),
      );
   }

   Copy(key: string, copySource: string, bucket?: string): Promise<void> {
      const bucketToUse = bucket || this.provider.config.bucketName;

      return new Promise((resolve, reject) =>
         this.provider.copyObject(
            {
               Key: key,
               CopySource: `${bucketToUse}/${copySource}`,
               Bucket: bucketToUse,
            },
            (err: Error) => {
               if (err) return reject(err);

               return resolve();
            },
         ),
      );
   }

   ListObjects(prefix?: string): Promise<IFileBucketResponse> {
      return new Promise((res, rej) =>
         this.provider.listObjectsV2(
            { Bucket: this.provider.config.bucketName, Prefix: prefix },
            (err: Error, data: any) => {
               if (err) return rej(err);

               if (data?.Contents) {
                  res({
                     body: data.Contents,
                     commonPrefixes: data.CommonPrefixes,
                  });
               } else {
                  rej('Data has no body');
               }
            },
         ),
      );
   }

   async Upload(file: EllahFile): Promise<IFileBucketResponse> {
      if (!file.key) throw new Error('No file key provided!');
      if (!file.buffer)
         throw new Error('No file buffer provided for file-bucket.');

      const base64regex =
         /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
      const fileIsBase64 =
         base64regex.test(file.buffer) || file.buffer?.includes(';base64,');

      return new Promise((res, rej) => {
         const params = {
            Bucket: this.provider.config.bucketName,
            Key: file.key,
            Body: fileIsBase64
               ? Buffer.from(file.buffer.replace(/^data:(.*,)?/, ''), 'base64')
               : Buffer.from(file.buffer, 'binary'),
            ContentType: file.contentType,
            ContentEncoding: fileIsBase64 ? 'base64' : undefined,
         };
         this.provider.upload(params, (err: Error, data: any) => {
            if (err) return rej(err);
            return res({
               location: data.Location,
               bucket: data.Bucket,
               key: data.Key,
            });
         });
      });
   }

   Delete(key: string): Promise<IFileBucketResponse> {
      return new Promise((res, rej) =>
         this.provider.deleteObject(
            { Key: key, Bucket: this.provider.config.bucketName },
            (err: Error) => {
               if (err) return rej(err);
               return res({ key });
            },
         ),
      );
   }
}
