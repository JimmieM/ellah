import filebucket from '../file-bucket/index.js';
import { getLinkContent } from './get-link-content.js';
import { Link } from './link.model.js';

async function findFiles(
   prefix: string,
   condition: (item: { [key: string]: string; Key: string }) => boolean,
): Promise<any[]> {
   const data = await filebucket.ListObjects(prefix);

   // Find matching files in the current "directory"
   const matchingFiles = data.body?.filter((item: any) => condition(item));

   // Search in subdirectories
   if (data.commonPrefixes) {
      for (let commonPrefix of data.commonPrefixes) {
         const subDirFiles = await findFiles(
            commonPrefix.Prefix as string,
            condition,
         );
         matchingFiles.push(...subDirFiles);
      }
   }

   return matchingFiles;
}

export const getLinkByName = async (name: string): Promise<Link[]> => {
   const files = await findFiles('link', ({ Key }) => {
      const splittedFilename = Key.split('|');
      return splittedFilename.some((nameSection: string) =>
         nameSection.includes(`name=${name}`),
      );
   });

   return files.map((file: any) => getLinkContent(file.Key));
};
