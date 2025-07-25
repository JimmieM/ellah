import clipboardy from 'clipboardy';

export const copyToClipboard = (content: string): void => {
   clipboardy.writeSync(content);
};
