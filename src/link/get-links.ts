import filebucket from '../file-bucket/index.js';
import { getLinkContent } from './get-link-content.js';

export const getLinks = async () => {
   const links = await filebucket.ListObjects('link');

   return links.body.map((file: any) => getLinkContent(file.Key));
};
