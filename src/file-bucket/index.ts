import { loadConfig } from '../config/user-config';
import { FileBucket } from './file-bucket';
import { S3FileBucketProvider } from './s3.fb.provider';

const config = loadConfig();

const initiatedFileBucket = new FileBucket(
   new S3FileBucketProvider({
      bucketName: config.storage.config.bucket.bucketName,
      region: config.storage.config.bucket.region,
      access: {
         username: config.storage.config.credentials.accessKeyId,
         password: config.storage.config.credentials.secretAccessKey,
      },
   }),
);

export default initiatedFileBucket;
