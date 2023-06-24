import filebucket from '../file-bucket';

export const getLinkByName = async (name: string): Promise<string> => {
   const file = await filebucket.Get(name);

   const fileContents = file.body.toString('utf-8');
   return fileContents;
};
