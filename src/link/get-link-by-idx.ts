import filebucket from '../file-bucket/index.js';
import { getLinkContent, linkFileToString } from './get-link-content.js';
import { Link } from './link.model.js';

export const getLinkByIndex = async (
   idx: number,
): Promise<Link | undefined> => {
   const objects = await filebucket.ListObjects('link');

   const key = objects?.body[idx]?.Key;

   if (!key) return;

   const file = await filebucket.Get(`link/${key}`);

   return getLinkContent(linkFileToString(file.body));
};
