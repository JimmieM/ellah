import filebucket from '../file-bucket/index.js';
import { getLinkContent, linkFileToString } from './get-link-content.js';
import { Link } from './link.model.js';

export const getLinkByName = async (name: string): Promise<Link> => {
   const file = await filebucket.Get(`link/${name}`);

   const link = getLinkContent(linkFileToString(file.body));

   return link;
};
