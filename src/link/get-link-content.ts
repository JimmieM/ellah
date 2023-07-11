import { Link } from './link.model.js';

export const linkFileToString = (file: any): string => {
   return file.toString('utf-8');
};

export const getLinkContent = (content: string): Link => {
   const splitted = content?.split('|');
   const name = splitted
      .find((section) => section.includes('name='))
      ?.split('=')[1];

   const link =
      splitted.find((section) => section.includes('link='))?.split('=')[1] ??
      '';

   const tags = splitted
      .find((section) => section.includes('tags='))
      ?.split('=')[1]
      ?.split(',');

   return {
      key: content,
      link,
      name,
      tags,
   };
};
