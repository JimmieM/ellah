import AWS from 'aws-sdk';
import { updateAwsConfig } from '../../index.js';

const s3 = new AWS.S3();

export const createBucket = (
   bucketName: string,
   region?: string,
): Promise<string> => {
   if (region) updateAwsConfig(region);

   const createBucketParams = {
      Bucket: bucketName,
   };

   return new Promise((resolve, reject) => {
      s3.createBucket(createBucketParams, (err, data) => {
         if (err || !data?.Location) {
            reject(err);
         } else {
            resolve(data?.Location!);
         }
      });
   });
};
