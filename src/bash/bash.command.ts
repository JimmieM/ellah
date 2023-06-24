import { Command } from 'commander';
import { spinnerSuccess, updateSpinnerText } from '../spinner.js';
import { reloadBashProfile } from './bash.util.js';

export const bashCommand = new Command('bash');

bashCommand.command('reload').action(async () => {
   updateSpinnerText('Processing ...');

   reloadBashProfile();

   spinnerSuccess();
});
