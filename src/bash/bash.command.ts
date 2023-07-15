import { Command } from 'commander';
import { getCurrentOS } from '../os/os.util.js';
import { spinnerSuccess, updateSpinnerText } from '../spinner.js';
import { reloadBashProfile } from './bash.util.js';

export const bashCommand = new Command('bash');

const reload = () => {
   updateSpinnerText('Processing ...');

   reloadBashProfile(getCurrentOS());

   spinnerSuccess();
};

bashCommand.command('reload').action(() => reload());
bashCommand.command('r').action(() => reload());
