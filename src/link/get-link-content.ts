import { Link } from './link.model.js';

export const linkFileToString = (file: any): string => {
   return file.toString('utf-8');
};

export const getLinkContent = (content: string): Link => {
   const isDir = !content.includes('[') && !content.includes(']');

   if (isDir)
      return {
         key: content,
         link: '',
         name: content,
      };

   const linkPath = content?.split('[')[0];

   const splittedContent = content?.split('|');
   const name = splittedContent
      .find((section) => section.includes('name='))
      ?.split('=')[1];

   const link =
      splittedContent
         .find((section) => section.includes('link='))
         ?.split('=')[1] ?? '';

   const decodedLink = decodeURIComponent(link);

   const tags = splittedContent
      .find((section) => section.includes('tags='))
      ?.split('=')[1]
      ?.split(',');

   return {
      key: linkPath + content,
      link: decodedLink,
      name,
      tags,
   };
};
