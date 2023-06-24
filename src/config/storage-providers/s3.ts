type S3BucketConfig = {
   bucketName: string;
   region: string;
};

type AWSAccessConfig = {
   accessKeyId: string;
   secretAccessKey: string;
};

export type S3StorageCredentials = {
   bucket: S3BucketConfig;
   credentials: AWSAccessConfig;
};
