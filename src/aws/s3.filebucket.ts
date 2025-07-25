import AWS from 'aws-sdk';
import {
   IFileBucketProvider,
   IFileBucketConfig,
} from '../file-bucket/file-bucket.js';

export class S3FileBucketProvider implements IFileBucketProvider {
   config: IFileBucketConfig;
   s3: AWS.S3;

   constructor(_config: IFileBucketConfig) {
      this.config = _config;
      this.s3 = new AWS.S3({
         accessKeyId: this.config.access.username,
         secretAccessKey: this.config.access.password,
         region: this.config.region,
      });
   }

   getSignedUrl = (
      type: 'putObject' | 'getObject',
      params: any,
      callback: any,
   ) => this.s3.getSignedUrl(type, params, callback);

   listObjectsV2 = (params: any, callback: any) =>
      this.s3.listObjectsV2(params, callback);

   getObject = (params: any, callback: any) =>
      this.s3.getObject(params, callback);

   upload = (params: any, callback: any) => this.s3.upload(params, callback);

   deleteObject = (params: any, callback: any) =>
      this.s3.deleteObject(params, callback);

   copyObject = (
      copyParams: {
         Bucket: string;
         CopySource: string;
         Key: string;
      },
      callback: any,
   ) => this.s3.copyObject(copyParams, callback);
}
