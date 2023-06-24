import { baseEntityCommands, EntityCommand } from '../entity/base-commands.js';
import { updateSpinnerText, spinnerSuccess, stopSpinner } from '../spinner.js';
import { syncBashProfileWithAliasDir } from './sync-alias-bash-profile.js';
import { syncAliasDir } from './sync-alias-dir.js';

const syncAliasDirAndBashProfile = async () => {
   await syncAliasDir();
   await syncBashProfileWithAliasDir();
};

export const aliasCommand = baseEntityCommands('alias', [
   { command: EntityCommand.ls },
   { command: EntityCommand.add, onSuccess: syncAliasDirAndBashProfile },
   { command: EntityCommand.edit, onSuccess: syncAliasDirAndBashProfile },
   { command: EntityCommand.exec },
   { command: EntityCommand.mv, onSuccess: syncAliasDirAndBashProfile },
   { command: EntityCommand.open },
   { command: EntityCommand.rm, onSuccess: syncAliasDirAndBashProfile },
   { command: EntityCommand.cp, onSuccess: syncAliasDirAndBashProfile },
]);

aliasCommand.command('sync').action(async () => {
   try {
      await syncAliasDirAndBashProfile();
      updateSpinnerText('Processing ...');
      console.log('File copied successfully.');

      spinnerSuccess();
   } catch (error) {
      console.warn('Failed to copy script.');
      stopSpinner();
   }
});
