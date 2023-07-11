import inquirer from 'inquirer';

export const selectListPrompt = <T>(
   message: string,
   choices: { name: string; value: T }[],
): Promise<T> => {
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
            resolve(answers.option);
         })
         .catch(reject);
   });
};
