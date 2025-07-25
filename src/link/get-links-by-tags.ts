import filebucket from '../file-bucket/index.js';
import { getLinkContent } from './get-link-content.js';
import { Link } from './link.model.js';
const entity = 'link';

export const getLinksByTags = async (
   tags: string,
   path?: string,
): Promise<Link> => {
   const listPath = path ? `${entity}/${path}` : entity;
   const files = await filebucket.ListObjects(listPath);

   const filteredFiles = files.body.filter(({ Key }: { Key: string }) => {
      const splittedFilename = Key.split('|');
      return splittedFilename.find((tagsSection) => {
         const splittedTags = tagsSection.split(`tags=`);
         if (splittedTags.length === 0) return false;

         const fileTags = splittedTags[0].split(',');
         return fileTags.some((tag) => tags.includes(tag));
      });
   });

   return (filteredFiles || []).map((file: any) => getLinkContent(file.Key));
};
