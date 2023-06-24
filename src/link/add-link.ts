import filebucket from '../file-bucket/index.js';
import { IFileBucketResponse } from '../file-bucket/file-bucket.js';
import { Link } from './link.model';

export const addLink = async (link: Link): Promise<IFileBucketResponse> => {
   const linkName = link.name ?? link.link;

   const content = `${link.link}|${link.name || ''}`;

   return await filebucket.Upload({
      key: `link/${linkName}`,
      buffer: content,
      contentType: 'text/plain',
      filename: linkName,
   });
};
