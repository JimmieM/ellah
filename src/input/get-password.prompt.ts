import inquirer, { QuestionCollection } from 'inquirer';

const getPassword = async (message?: string): Promise<string> => {
   const questions: QuestionCollection = [
      {
         name: 'password',
         type: 'password',
         message: message ?? 'Enter your password:',
         validate: function (value: any) {
            if (value.length) {
               return true;
            } else {
               return 'Please enter your password.';
            }
         },
      },
   ];

   const answers = await inquirer.prompt(questions);
   return answers.password;
};

export default getPassword;
