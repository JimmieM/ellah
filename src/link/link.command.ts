import { Command } from 'commander';
import { addLink } from './add-link.js';
import { getLinkByName } from './get-link-by-name.js';
import { getLinks } from './get-links.js';
import { spinnerSuccess, stopSpinner, updateSpinnerText } from '../spinner.js';
import open from 'open';
import { toUrlWithPrefix } from '../util/url.util.js';

export const linkCommand = new Command('link');

linkCommand.command('ls').action(async () => {
   updateSpinnerText('Processing ');

   const links = await getLinks();

   spinnerSuccess();
   console.table(links);
});

linkCommand.command('add <link> [name]').action(async (link, name) => {
   updateSpinnerText('Processing ...');

   await addLink({
      link,
      name,
   });

   spinnerSuccess(`${link} successfully added!`);
});

linkCommand.command('open <name>').action(async (name) => {
   updateSpinnerText('Processing ...');

   const link = await getLinkByName(name);

   if (!link) {
      stopSpinner();
      return console.warn('Link not found.');
   }

   spinnerSuccess();
   await open(toUrlWithPrefix(link));
});
