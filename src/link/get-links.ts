import filebucket from '../file-bucket';

export const getLinks = async () => {
   const links = await filebucket.ListObjects('link');
   console.table(links);
};
