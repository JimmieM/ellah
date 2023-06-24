import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Location of the config directory and file
const baseDir = path.join(os.homedir(), '.ellah-cli');
const syncPath = path.join(baseDir, '/synced');

const getScriptExecutionOptions = (scriptPath: string) => {
   const extension = path.extname(scriptPath);

   switch (extension) {
      case '.bash':
      case '.sh':
         return { shell: '/bin/bash' };

      default:
         return {};
   }
};

const toCommandStringByFileType = (scriptPath: string, args: any): string => {
   const extension = path.extname(scriptPath);

   let command = '';
   switch (extension) {
      case '.bash':
      case '.sh':
         command = `bash ${scriptPath}`;
         break;
      case '.py':
         command = `python ${scriptPath}`;
         break;
      case '.js':
         command = `node ${scriptPath}`;
         break;
      default:
         console.error('Unsupported file extension:', extension);
         break;
   }

   // Append script arguments to the command
   if (args.length > 0) {
      command += ` ${args.join(' ')}`;
   }

   switch (extension) {
      case '.bash':
      case '.sh':
         command += ` 2>&1`;
         break;
   }

   console.warn('complete cmd: ', command);

   return command;
};

export const saveScriptToPath = (
   entityPath: string,
   filePath: string,
   file: any,
): string => {
   const scriptPath = `${syncPath}/${entityPath}/${filePath}`;

   try {
      fs.mkdirSync(`${syncPath}/${entityPath}`, { recursive: true });
   } catch (e) {
      console.log('Cannot create folder ', e);
   }
   const x = fs.writeFileSync(scriptPath, file);

   // Make the script executable
   fs.chmodSync(scriptPath, '755');

   return scriptPath;
};

export const executeScript = (
   scriptPath: string,
   args: any,
): Promise<{
   output: string;
   error?: string;
}> => {
   const command = toCommandStringByFileType(scriptPath, args);
   if (command === '')
      return Promise.reject(
         'Execution failed. Read logs above for more detailed information regarding what went wrong.',
      );

   console.warn(args);

   const options = getScriptExecutionOptions(scriptPath);

   return new Promise((resolve, reject) => {
      // Append script path and arguments to the command

      const childProcess = exec(
         command,
         options,
         (error: any, stdout: any, stderr: any) => {
            if (error) {
               console.error('Error executing script:', error);
               reject(error);
            } else {
               resolve({
                  output: stdout,
                  error: stderr,
               });
            }
         },
      );

      // Handle non-zero exit codes for all script languages
      childProcess.on('exit', (code) => {
         if (code !== 0) {
            console.error(`Script exited with non-zero code: ${code}`);
         }
      });
   });
};
