export const toUrlWithPrefix = (url: string): string => {
   if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return `https://${url}`;
   }
   return url;
};
