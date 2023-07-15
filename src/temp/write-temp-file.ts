import { IFileBucket } from '../file-bucket/file-bucket';
import { writeFile } from '../util/file.util.js';
import { buildPath } from '../util/path.util.js';
import { tempDir } from './temp-dir.js';

export const writeTempFile = async (
   entity: string,
   filePath: string,
   filebucket: IFileBucket,
   dirOrDefaultTemp?: string,
): Promise<string> => {
   try {
      const tempFile = buildPath(dirOrDefaultTemp ?? tempDir, entity, filePath);

      const file = await filebucket.Get(`${entity}/${filePath}`);

      await writeFile(tempFile, file.body);

      return tempFile;
   } catch (error) {
      throw error;
   }
};
