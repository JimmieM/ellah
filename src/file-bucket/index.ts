import { loadConfig } from '../config/user-config.js';
import { FileBucket } from './file-bucket.js';
import { S3FileBucketProvider } from '../aws/s3.filebucket.js';

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
