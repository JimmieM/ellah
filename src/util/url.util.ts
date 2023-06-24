export function toUrlWithPrefix(url: string) {
   if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return `https://${url}`;
   }
   return url;
}
