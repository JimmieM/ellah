import filebucket from '../file-bucket/index.js';
import { removeFilesInDirRecursive, writeFile } from '../util/file.util.js';
import { buildPath } from '../util/path.util.js';
import { ellahAliasDir } from './alias.config.js';

export const syncAliasDir = async (): Promise<void> => {
   const res = await filebucket.ListObjects('alias');
   if (!res || !res.body) {
      console.warn('No objects to sync');
      return;
   }

   await removeFilesInDirRecursive(ellahAliasDir);

   const createFilesPromises = res.body.map(async (obj: any) => {
      const file = await filebucket.Get(obj.Key);
      if (!file) return;
      const key = obj.Key.replace('alias/', '').replace('/alias/', '');
      await writeFile(buildPath(ellahAliasDir, key), file.body);
   });

   await Promise.all(createFilesPromises);
};
