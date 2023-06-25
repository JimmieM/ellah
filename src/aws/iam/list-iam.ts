import AWS from 'aws-sdk';
import { IAMProfile } from './iam.model';

const iam = new AWS.IAM();

export const listProfiles = async (): Promise<IAMProfile[]> => {
   try {
      const response = await iam.listUsers().promise();
      return response.Users.map((user) => ({
         userId: user.UserId,
         userName: user.UserName,
         arn: user.Arn,
         createDate: user.CreateDate,
         path: user.Path,
      }));
   } catch (error) {
      console.error('Error listing IAM profiles:', error);
      return [];
   }
};
