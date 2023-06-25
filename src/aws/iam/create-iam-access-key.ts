import AWS from 'aws-sdk';

import { AccessKey } from 'aws-sdk/clients/iam';

const iam = new AWS.IAM();

export const createAccessKeys = async (
   username: string,
): Promise<AccessKey> => {
   try {
      const createAccessKeyParams = {
         UserName: username,
      };

      const createAccessKeyResponse = await iam
         .createAccessKey(createAccessKeyParams)
         .promise();

      return createAccessKeyResponse.AccessKey;
   } catch (error) {
      console.error('Error creating access keys:', error);
      throw new Error(error as string);
   }
};
