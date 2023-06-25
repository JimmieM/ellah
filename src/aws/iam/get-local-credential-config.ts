import fs from 'fs';
import os from 'os';

export const parseLocalAwsProfiles = (): string[] => {
   const credentialsFilePath = `${os.homedir()}/.aws/credentials`;

   const credentialsFileContent = fs.readFileSync(credentialsFilePath, 'utf8');

   const profiles =
      credentialsFileContent
         .match(/\[(.*?)\]/g)
         ?.map((profile) => profile.slice(1, -1)) || [];

   return profiles;
};

export const getAwsCredentialsByProfile = (
   profile: string,
): { accessKeyId: string | null; secretAccessKey: string | null } => {
   const credentialsFilePath = `${os.homedir()}/.aws/credentials`;

   const credentialsFileContent = fs.readFileSync(credentialsFilePath, 'utf8');

   const profileSectionRegex = new RegExp(
      `\\[${profile}\\]([\\s\\S]*?)(?=\\[|$)`,
   );
   const profileSection =
      credentialsFileContent.match(profileSectionRegex)?.[0] || '';

   const accessKeyIdMatch = profileSection.match(/aws_access_key_id = (.+)/);
   const secretAccessKeyMatch = profileSection.match(
      /aws_secret_access_key = (.+)/,
   );

   const accessKeyId = accessKeyIdMatch?.[1] || null;
   const secretAccessKey = secretAccessKeyMatch?.[1] || null;

   return { accessKeyId, secretAccessKey };
};
