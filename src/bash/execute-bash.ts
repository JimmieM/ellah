import { exec } from 'child_process';
import { getCurrentOS } from '../os/os.util.js';
import { getShellCommandForOS } from './bash.util.js';

export const executeBash = (
   command: string,
   options?: any,
): Promise<{
   output: string;
   error?: string;
}> => {
   return new Promise((resolve, reject) => {
      // Append script path and arguments to the command
      const platform = getCurrentOS();
      const shell = getShellCommandForOS(platform);

      const childProcess = exec(
         command,
         options || { shell: shell },
         (error: any, stdout: any, stderr: any) => {
            if (error) {
               console.error('Error executing bash:', error);
               reject(error);
            } else {
               console.warn(stderr);

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
