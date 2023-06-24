import { exec } from 'child_process';

export const executeBash = (
   command: string,
   options?: any,
): Promise<{
   output: string;
   error?: string;
}> => {
   return new Promise((resolve, reject) => {
      // Append script path and arguments to the command

      const childProcess = exec(
         command,
         options || { shell: '/bin/bash' },
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
