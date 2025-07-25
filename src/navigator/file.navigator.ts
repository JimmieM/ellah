import {
   NavigationItem,
   selectListPrompt,
} from '../input/select-list.prompt.js';

export const fileNavigator = async (
   message: string,
   getChoicesFunc: (path?: string, ...args: any) => Promise<NavigationItem[]>,
): Promise<NavigationItem> => {
   const choices = await getChoicesFunc();

   const selectedValue = await selectListPrompt(message, choices);
   console.warn({ selectedValue });
   if (selectedValue.isDir) {
      return await fileNavigator(message, (path) =>
         getChoicesFunc(`${path}/${selectedValue.value}`),
      );
   }

   return selectedValue;
};
