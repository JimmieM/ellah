import AWS from 'aws-sdk';
import { updateAwsConfig } from '../../index.js';
import { S3Bucket } from './bucket.model.js';

const s3 = new AWS.S3();

export const getBuckets = (region?: string): Promise<S3Bucket[]> => {
   if (region) updateAwsConfig(region);

   return new Promise((resolve, reject) => {
      s3.listBuckets((err, data) => {
         if (err) {
            reject(err);
         } else {
            const buckets =
               data?.Buckets?.map((bucket) => ({
                  name: bucket.Name!,
                  creationDate: bucket.CreationDate!,
               })) || [];
            resolve(buckets);
         }
      });
   });
};
