import AWS from 'aws-sdk';
import { updateAwsConfig } from '../../index.js';

const s3 = new AWS.S3();

export const deleteBucket = (
   bucketName: string,
   region?: string,
): Promise<void> => {
   if (region) updateAwsConfig(region);

   const createBucketParams = {
      Bucket: bucketName,
   };

   return new Promise((resolve, reject) => {
      s3.deleteBucket(createBucketParams, (err, data) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
};
