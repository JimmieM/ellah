import filebucket from '../file-bucket/index.js';
import { buildPath } from '../util/path.util.js';
import { getLinkContent } from './get-link-content.js';
const entity = 'link';

export const getLinks = async (path?: string) => {
   const listPath = path ? buildPath(entity, path) : entity;

   const links = await filebucket.ListObjects(listPath);

   return links.body.map((file: any) => getLinkContent(file.Key));
};
