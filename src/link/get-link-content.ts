import { Link } from './link.model.js';

export const linkFileToString = (file: any): string => {
   return file.toString('utf-8');
};

export const getLinkContent = (content: string): Link => {
   const splitted = content.split('|');
   return {
      link: splitted[0],
      name: splitted[1],
   };
};
