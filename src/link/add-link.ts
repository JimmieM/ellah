import filebucket from '../file-bucket/index.js';
import { IFileBucketResponse } from '../file-bucket/file-bucket.js';
import { Link } from './link.model';

export const addLink = async (
   link: Omit<Link, 'key'> & { path: string },
): Promise<IFileBucketResponse> => {
   const linkName = link.name || link.link;
   const linkPath = link.path ? `${link.path}/` : '';

   const content = `${linkPath}"name=${linkName ?? ''}|link=${
      link.link
   }|tags=${(link.tags || []).join(',')}"`;

   return await filebucket.Upload({
      key: `link/${content}`,
      buffer: content,
      contentType: 'text/plain',
      filename: content,
   });
};
