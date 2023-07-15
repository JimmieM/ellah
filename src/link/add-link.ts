import { IFileBucketResponse } from '../file-bucket/file-bucket.js';
import { Link } from './link.model';
import filebucket from '../file-bucket/index.js';

export const addLink = async (
   link: Omit<Link, 'key'> & { path?: string },
): Promise<IFileBucketResponse> => {
   const encodedLink = encodeURIComponent(link.link);
   const linkName = link.name || encodedLink;
   const linkPath = link.path ? `${link.path}/` : '';

   const content = `${linkPath}[name=${
      linkName ?? ''
   }|link=${encodedLink}|tags=${(link.tags || []).join(',')}]`;

   console.warn({ content });

   return await filebucket.Upload({
      key: `link/${content}`,
      buffer: content,
      contentType: 'text/plain',
      filename: content,
   });
};
