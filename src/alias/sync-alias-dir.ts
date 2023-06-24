import filebucket from '../file-bucket';
import { writeFile } from '../util/file.util.js';
import { buildPath } from '../util/path.util';
import { ellahAlias } from './alias.config.js';

export const syncAliasDir = async (): Promise<void> => {
   const res = await filebucket.ListObjects('alias');
   if (!res || !res.body) {
      console.warn('No objects to sync');
      return;
   }

   const createFilesPromises = res.body.map(async (obj: any) => {
      const file = await filebucket.Get(obj.Key);
      if (!file) return;
      await writeFile(buildPath(ellahAlias, obj.Key), file.body);
   });

   await Promise.all(createFilesPromises);
};
