import filebucket from '../file-bucket/index.js';

export const getLinks = async () => {
   const links = await filebucket.ListObjects('link');

   console.table(links);
};
