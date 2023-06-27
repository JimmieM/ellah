#!/usr/bin/env node
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

import AWS from 'aws-sdk';
import { Command } from 'commander';
import { aliasCommand } from './alias/alias.command.js';
import { awsCommand } from './aws/aws.command.js';
import { bashCommand } from './bash/bash.command.js';
import { configCommand } from './config/config.command.js';
import { loadConfig } from './config/user-config.js';
import { imageCommand } from './img/img.command.js';
import { linkCommand } from './link/link.command.js';
import { scriptCommand } from './script/script.command.js';

const config = loadConfig();

export const updateAwsConfig = (region?: string) => {
   AWS.config.update({
      ...config.storage.config.credentials,
      region: region ?? config.storage.config.bucket.region,
   });
};

updateAwsConfig();

const program = new Command();

/* CONFIG */
program.addCommand(configCommand);
program.addCommand(awsCommand);

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
