#!/usr/bin/env node
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

import { Command } from 'commander';
import { aliasCommand } from './alias/alias.command.js';
import { awsCommand } from './config/config.aws.command.js';
import { dbCommand } from './config/config.db.command.js';
import { editorCommand } from './config/config.editor.command.js';
import { configCommand } from './config/config.command.js';

import { linkCommand } from './link/link.command.js';
import { scriptCommand } from './script/script.command.js';
import { bashCommand } from './bash/bash.command.js';

const program = new Command();
program.description('Ellah CLI');
program.version('0.0.1');

/* CONFIG */
program.addCommand(configCommand);
program.addCommand(awsCommand);
program.addCommand(dbCommand);
program.addCommand(editorCommand);

/* SCRIPT */
program.addCommand(scriptCommand);

/* LINK */
program.addCommand(linkCommand);

/* ALIAS */
program.addCommand(aliasCommand);

/* BASH */
program.addCommand(bashCommand);

async function main() {
   await program.parseAsync(process.argv);
}
console.log(); // log a new line so there is a nice space
main();
