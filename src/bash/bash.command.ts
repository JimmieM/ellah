import { Command } from 'commander';
import { spinnerSuccess, updateSpinnerText } from '../spinner.js';
import { reloadBashProfile } from './bash.util.js';

export const bashCommand = new Command('bash');

const reload = () => {
   updateSpinnerText('Processing ...');

   reloadBashProfile();

   spinnerSuccess();
};

bashCommand.command('reload').action(() => reload());
bashCommand.command('r').action(() => reload());
