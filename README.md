# Ellah: Your Personalized Command Line Tool

## About

Ellah is a powerful command line interface (CLI) tool designed to synchronize scripts, images, links, and more across multiple devices. It allows users to add, remove, execute, and manage files via a simple and intuitive set of commands. With ellah, you can make your development setup consistent across all your machines, simplifying your workflow and boosting your productivity.

## Why Ellah

As developers, we often find ourselves repeating the same setup processes on multiple machines or struggling to keep our scripts and configurations synchronized. ellah was born out of the need to streamline this process. With ellah, you can:

-  Sync your scripts, images, links, and more across all your devices.
-  Automatically add bash scripts and aliases to your bash profile, keeping your workflow consistent across devices. Whether a script needs to be executed on start or during terminal start, everything can be synced effortlessly.
-  Execute scripts stored in the cloud directly from your command line.
-  Easily add or remove resources with simple commands.
-  Keep your workflow consistent and efficient, no matter where you're coding from.

## Installation

```console
npm install -g ellah
```

## Setup

View your current config, all keys should be empty.

```console
ellah config ls
```

Set your file provider. At the moment only Amazon S3 is supported.

[Setup AWS access keys](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)

\`\`bash
ellah config set provider s3
\`\`

Configure your S3 credentials

```bash
ellah config aws credentials set accessKeyId [myAccessKeyId]
```

```bash
ellah config aws credentials set secretAccessKey [mySecretAccessKey]
```

Configure your S3 bucket

```bash
ellah config aws bucket set bucketName [myBucket]
```

```bash
ellah config aws bucket set region [myRegion]
```

View your current config, all keys should be defined.

```bash
ellah config ls
```

### Setup using export and import.

After running export you'll be prompted to enter a password to encrypt the contents of your configuration file.

```bash
ellah config export ./path/to/export
```

After runnig import you'll be prompted to enter your password in order to decrypt the contents.

```bash
ellah config import ./path/to/export/config.enc
```

View your imported config

```bash
ellah config ls
```

## How to Use

Here's the basic command structure of ellah:

```bash
ellah [entity] [action] [file] [args]
```

Here are some examples:

-  To list all images:

   ```bash
   ellah img ls
   ```

-  To add an image:

   ```bash
   ellah img add example.png --someArg
   ```

-  To list all scripts:

   ```bash
   ellah script ls
   ```

-  To execute a script:

   ```bash
   ellah script exec script.sh
   ```

-  To move a script:

   ```bash
   ellah script mv script.sh destinationPath/script.sh

   // changed your mind?
   ellah script mv destinationPath/script.sh script.sh
   ```

-  To remove a script:

   ```bash
   ellah script rm script.sh
   ```

-  To open the original source of a script:

   ```bash
   ellah script origin script.sh
   ```

-  To add a link (provide a unique link name for easier management):

   ```bash
   ellah link add example.com myLinkName
   ```

-  To open a link:

   ```bash
   ellah link open example.com
   ```

-  To open a link by its unique name:

   ```bash
   ellah link open myLinkName
   ```

-  To remove a link:

   ```bash
   ellah link remove example.com
   ```

-  To remove a link by its name:
   ```bash
   ellah link remove myLinkName
   ```

For a complete list of commands and their explanations, please refer to the Commands section.

You can expect to find the same actions for all entities.
Actions include but are not limited to:

-  add (add a file or object)
-  rm (remove a file or object)
-  mv (move a file or object)
-  open (open a file, link or object)
-  origin (open origin file hosted on your file provider)
-  cp (copy file or object)
-  edit (edit file)

## Commands

(To be filled with a detailed list of commands, their descriptions, and examples of their usage.)

## Contribution

ellah is an open-source project, and we welcome contributions of all sorts. Whether you're fixing bugs, improving documentation, or proposing new features, your efforts are greatly appreciated. Please check out our Contribution Guidelines for detailed instructions.

## License

ellah is licensed under the MIT license.

## Contact

For any questions, suggestions, or just to say hello, feel free to reach out at hej@jimmiem.se.
