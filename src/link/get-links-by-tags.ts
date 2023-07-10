import filebucket from '../file-bucket/index.js';
import { getLinkContent } from './get-link-content.js';
import { Link } from './link.model.js';

export const getLinksByTags = async (tags: string): Promise<Link> => {
   const files = await filebucket.ListObjects('link');

   const filteredFiles = files.body.filter(({ Key }: { Key: string }) => {
      const splittedFilename = Key.split('|');
      return splittedFilename.find((tagsSection) => {
         const splittedTags = tagsSection.split(`tags=`);
         if (splittedTags.length === 0) return false;

         const tags = splittedTags[0].split(',');
         return tags.some((tag) => tags.includes(tag));
      });
   });

   return (filteredFiles || []).map((file: any) => getLinkContent(file.Key));
};
