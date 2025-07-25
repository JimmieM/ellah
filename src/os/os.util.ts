import os from 'os';

export const getCurrentOS = () => {
   return os.platform();
};

export const getOSUsername = () => {
   return os.userInfo().username;
};
