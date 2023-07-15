import filebucket from '../file-bucket/index.js';
import { getLinkContent } from './get-link-content.js';
import { Link } from './link.model.js';

export const getLinkByUrlIncludes = async (url: string): Promise<Link[]> => {
   const files = await filebucket.ListObjects('link');

   return files.body
      .filter(({ Key }: { Key: string }) => {
         const splittedFilename = Key.split('|');
         return splittedFilename.find(
            (nameSection) =>
               nameSection.includes(`url=`) && nameSection.includes(url),
         );
      })
      .map((file: any) => getLinkContent(file.Key));
};
