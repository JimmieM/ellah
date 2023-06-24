import { Command } from 'commander';
import { spinnerSuccess, updateSpinnerText } from '../spinner';
import { reloadBashProfile } from './bash.util';

export const bashCommand = new Command('bash');

bashCommand.command('reload').action(async () => {
   updateSpinnerText('Processing ...');

   reloadBashProfile();

   spinnerSuccess();
});
