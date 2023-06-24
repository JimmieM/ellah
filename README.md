# Ellah: Your Personalized Command Line Tool

## About

Ellah is a powerful command line interface (CLI) tool designed to synchronize scripts, images, links, and more across multiple devices. It allows users to add, remove, execute, and manage files via a simple and intuitive set of commands. With Ellah, you can make your development setup consistent across all your machines, simplifying your workflow and boosting your productivity.

## Why Ellah

As developers, we often find ourselves repeating the same setup processes on multiple machines or struggling to keep our scripts and configurations synchronized. Ellah was born out of the need to streamline this process. With Ellah, you can:

-  Sync your scripts, images, links, and more across all your devices.
-  Automatically add bash scripts and aliases to your bash profile, keeping your workflow consistent across devices. Whether a script needs to be executed on start or during terminal start, everything can be synced effortlessly.
-  Execute scripts stored in the cloud directly from your command line.
-  Easily add or remove resources with simple commands.
-  Manage multiple profiles, allowing you to quickly switch between different workflows. Just use `ellah profile mySecondProfile` to switch to a different set of scripts, aliases, images, etc.
-  Keep your workflow consistent and efficient, no matter where you're coding from.

## Installation

\`\`\`bash
npm install Ellah
\`\`\`

## Setup

View your current config, all keys should be empty.
\`\`\`bash
ellah config ls
\`\`\`

Set your file provider. At the moment only Amazon S3 is supported.
\`\`\`bash
ellah config set provider s3
\`\`\`

Configure your S3 credentials
\`\`\`bash
ellah config aws credentials set accessKeyId [myAccessKeyId]
ellah config aws credentials set secretAccessKey [mySecretAccessKey]
\`\`\`

Configure your S3 bucket
\`\`\`bash
ellah config aws bucket set bucketName [myBucket]
ellah config aws bucket set region [myRegion]
\`\`\`

View your current config, all should be defined.
\`\`\`bash
ellah config ls
\`\`\`

### You're done.

## How to Use

Here's the basic command structure of Ellah:

\`\`\`bash
Ellah [entity] [action] [file] [args]
\`\`\`

Here are some examples:

-  To list all images:
   \`\`\`bash
   Ellah img ls
   \`\`\`

-  To add an image:
   \`\`\`bash
   Ellah img add example.png --someArg
   \`\`\`

-  To list all scripts:
   \`\`\`bash
   Ellah script ls
   \`\`\`

-  To execute a script:
   \`\`\`bash
   Ellah script exec script.sh
   \`\`\`

-  To move a script:
   \`\`\`bash
   Ellah script mv script.sh destinationPath/script.sh

   // changed your mind?
   Ellah script mv destinationPath/script.sh script.sh
   \`\`\`

-  To remove a script:
   \`\`\`bash
   Ellah script rm script.sh
   \`\`\`

-  To open the original source of a script:
   \`\`\`bash
   Ellah script open script.sh
   \`\`\`

-  To add a link (provide a unique link name for easier management):
   \`\`\`bash
   Ellah link add example.com myLinkName
   \`\`\`

-  To open a link:
   \`\`\`bash
   Ellah link open example.com
   \`\`\`

-  To open a link by its unique name:
   \`\`\`bash
   Ellah link open myLinkName
   \`\`\`

-  To remove a link:
   \`\`\`bash
   Ellah link remove example.com
   \`\`\`

-  To remove a link by its name:
   \`\`\`bash
   Ellah link remove myLinkName
   \`\`\`

For a complete list of commands and their explanations, please refer to the Commands section.

You can expect to find the same actions for all entities.
Actions include but are not limited to:

-  open
-  add
-  remove
-  rm
-  mv

## Commands

(To be filled with a detailed list of commands, their descriptions, and examples of their usage.)

## Contribution

Ellah is an open-source project, and we welcome contributions of all sorts. Whether you're fixing bugs, improving documentation, or proposing new features, your efforts are greatly appreciated. Please check out our Contribution Guidelines for detailed instructions.

## License

Ellah is licensed under the MIT license.

## Contact

For any questions, suggestions, or just to say hello, feel free to reach out at hej@jimmiem.se.
