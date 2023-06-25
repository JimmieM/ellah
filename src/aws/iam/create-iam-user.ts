import { IAM } from 'aws-sdk';

const iam = new IAM();

export const createIAMUser = async (username: string): Promise<string> => {
   try {
      const createUserParams = {
         UserName: username,
      };

      const createUserResponse = await iam
         .createUser(createUserParams)
         .promise();

      return createUserResponse?.User?.UserName!;
   } catch (error) {
      throw new Error(error as string);
   }
};
