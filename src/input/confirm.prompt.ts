import inquirer from 'inquirer';

export const confirmPrompt = (message: string): Promise<boolean> => {
   return new Promise((resolve, reject) =>
      inquirer
         .prompt([
            {
               type: 'confirm',
               name: 'confirmation',
               message: message,
               default: false,
            },
         ])
         .then((answers) => {
            resolve(answers.confirmation);
         })
         .catch(reject),
   );
};
