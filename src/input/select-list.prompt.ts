import inquirer from 'inquirer';

export interface NavigationItem {
   name: string;
   value: string;
   isDir?: boolean;
}

export const selectListPrompt = (
   message: string,
   choices: NavigationItem[],
): Promise<NavigationItem> => {
   return new Promise((resolve, reject) => {
      const questions = [
         {
            type: 'list',
            name: 'option',
            message: message,
            choices: choices,
         },
      ];

      inquirer
         .prompt(questions)
         .then((answers) => {
            const option = answers.option;

            const item = choices.find((choice) => choice.value === option);
            resolve(
               item || {
                  value: option,
                  name: '',
               },
            );
         })
         .catch(reject);
   });
};
