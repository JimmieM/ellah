import filebucket from '../file-bucket';
import { IFileBucketResponse } from '../file-bucket/file-bucket';

export const addLink = async (link: {
   link: string;
   name?: string;
}): Promise<IFileBucketResponse> => {
   const linkName = link.name ?? link.link;
   return await filebucket.Upload({
      key: `${'link'}/${linkName}`,
      buffer: link.link,
      contentType: 'text/plain',
      filename: linkName,
   });
};
