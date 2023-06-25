#!/usr/bin/env node
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

import { Command } from 'commander';
import { aliasCommand } from './alias/alias.command.js';
import {
   awsCommand,
   iamCommand,
   localAwsCredentials,
} from './aws/aws.command.js';
import { dbCommand } from './config/config.db.command.js';
import { editorCommand } from './config/config.editor.command.js';
import { configCommand } from './config/config.command.js';
import { linkCommand } from './link/link.command.js';
import { scriptCommand } from './script/script.command.js';
import { bashCommand } from './bash/bash.command.js';
import { imageCommand } from './img/img.command.js';
import AWS from 'aws-sdk';
import { loadConfig } from './config/user-config.js';

const config = loadConfig();

AWS.config.credentials = config.storage.config.credentials;

const program = new Command();
program.description('Ellah CLI');
program.version('1.0.0');

program.addHelpCommand(
   'help [cmd]',
   'Need help with setup? https://github.com/JimmieM/ellah/tree/main',
);

/* CONFIG */
program.addCommand(configCommand);
program.addCommand(awsCommand);
program.addCommand(iamCommand);

/* SCRIPT */
program.addCommand(scriptCommand);

/* LINK */
program.addCommand(linkCommand);

/* IMAGE */
program.addCommand(imageCommand);

/* ALIAS */
program.addCommand(aliasCommand);

/* BASH */
program.addCommand(bashCommand);

async function main() {
   await program.parseAsync(process.argv);
}

console.log(); // log a new line so there is a nice space
await main();
