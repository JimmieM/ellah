import AWS from 'aws-sdk';

const iam = new AWS.IAM();

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
