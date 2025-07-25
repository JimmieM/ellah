# Ellah: CLI for syncing developer resources and alias

## This repo is no longer maintained.

# Table of Contents

- [Ellah: CLI for syncing developer resources and alias](#ellah-cli-for-syncing-developer-resources-and-alias)
  - [This repo is no longer maintained.](#this-repo-is-no-longer-maintained)
- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Upcoming](#upcoming)
  - [Backlog](#backlog)
- [Why Ellah](#why-ellah)
- [Installation](#installation)
  - [Step 1](#step-1)
    - [Option 1 - Configure by using your local AWS IAM profile credentials (recommended for first time users with AWS configured)](#option-1---configure-by-using-your-local-aws-iam-profile-credentials-recommended-for-first-time-users-with-aws-configured)
    - [Option 2 - Setup using export and import (recommended to use this step if you're configuring for another computer)](#option-2---setup-using-export-and-import-recommended-to-use-this-step-if-youre-configuring-for-another-computer)
    - [Option 3 - Manually set your accessKeyId and secretAccessKey](#option-3---manually-set-your-accesskeyid-and-secretaccesskey)
  - [Step 2](#step-2)
    - [Option 1 - Manually configure your S3 bucket](#option-1---manually-configure-your-s3-bucket)
    - [Option 2 - Create and use a new S3 bucket](#option-2---create-and-use-a-new-s3-bucket)
- [How to Use](#how-to-use)
- [General examples](#general-examples)
- [Alias](#alias)
  - [Contribution](#contribution)
  - [License](#license)
  - [Contact](#contact)

# Introduction

Ellah is a powerful command line interface (CLI) tool designed to synchronize scripts and aliases across multiple devices. It allows users to add, remove, execute, and manage files via a simple and intuitive set of commands. With Ellah, you can make your development setup consistent across all your machines, simplifying your workflow and boosting your productivity.

# Upcoming

Since this tool was specifically created for a specific need of mine, I'm still looking into supporting further file providers such as Dropbox etc. With ease you could configure Ellah to use your Dropbox API key instead of AWS IAM.

## Backlog

-  Support Dropbox
-  Improve sync functionality

# Why Ellah

Developers often deal with repetitive setup processes across different operating systems, which can be tedious and time-consuming. Ellah was designed to address this problem, offering a streamlined solution for developers.

With Ellah, you can:

-  Sync your scripts and aliases all devices, regardless of the OS.
-  Automatically add scripts and aliases to your OS-specific profile or maintain default aliases across all platforms.
-  Run cloud-stored scripts directly from your command line, including bash scripts on a Windows machine.
-  Easily manage resources with quick commands.
-  Maintain a consistent, efficient workflow, whether you're coding on MacOS or Windows.
-  Furthermore, Ellah allows you to export, import, and encrypt your config file, making it effortless to sync up a new computer. It's an essential tool for developers seeking simplicity and efficiency across multiple platforms.

# Installation

```console
npm install -g ellah
```

Set default editor when editing files in ellah CLI. Default for unix is nano. If you're on windows and doesn't have nano or vim installed it defaults to notepad.
Supported editors:

-  nano
-  vi
-  notepad (default windows fallback)

```console
ellah config set editor [myEdtior]
```

## Step 1

### Option 1 - Configure by using your local AWS IAM profile credentials (recommended for first time users with AWS configured)

Set your accessKeyId and secretAccessKey using your local ~/.aws configuration

Run Ellah to view your profiles in ~/.aws

```bash
ellah aws iam profile ls
```

View credentials of selected profile

```bash
ellah aws iam profile get <profileName>
```

Configure Ellah to use your profile credentials

```bash
ellah aws iam profile use <profileName>
```

View your current config, all keys should be defined.

```bash
ellah config ls
```

### Option 2 - Setup using export and import (recommended to use this step if you're configuring for another computer)

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

### Option 3 - Manually set your accessKeyId and secretAccessKey

Set your file provider. At the moment only Amazon S3 is supported.

```bash
ellah config set provider s3
```

Configure your S3 credentials

[Setup AWS access keys](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)

```bash
ellah aws set accessKeyId [myAccessKeyId]
```

```bash
ellah aws set secretAccessKey [mySecretAccessKey]
```

## Step 2

### Option 1 - Manually configure your S3 bucket

```bash
ellah config set provider s3
```

Once logged in with IAM you can list your buckets

```bash
ellah aws bucket ls
ellah aws bucket ls --region eu-north-1
```

Set a bucket name

```bash
ellah aws set bucketName [myBucket]
```

Set a region for Ellah to always use

```bash
ellah aws set region [myRegion]
```

### Option 2 - Create and use a new S3 bucket

With Ellah you can use your IAM configuration to create a bucket with ease.

Create a new bucket
Use the --use argument to configure Ellah to use your new bucket and region, if provided.

```bash
ellah aws bucket create [bucketName] --use --region [region]
```

View your current config, all keys should be defined.

```bash
ellah config ls
```

# How to Use

Here's the basic command structure of Ellah:

```bash
ellah [entity] [action] [file] [args]
```

# General examples

Here are some examples:

-  To list all aliases

   ```bash
    ellah alias ls
   ```

-  To list OS specific aliases (win or unix)

   ```bash
    ellah alias ls --os win
   ```

   -  To create a new alias

   ```bash
    ellah alias new mySharedBashFile.sh
    ellah alias new myMacFile.sh --os unix
    ellah alias new myWinFile.sh --os win
   ```

-  To add an alias

   ```bash
    ellah alias add mySharedBashFile.sh
    ellah alias add myMacFile.sh --os unix
    ellah alias add myWinFile.sh --os win
   ```

-  To remove an alias

   ```bash
    ellah alias rm mySharedBashFile.sh
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
   ellah script mv script.sh newscriptname.sh
   ```

-  To remove a script:

   ```bash
   ellah script rm script.sh
   ```

-  To open the original source of a script:

   ```bash
   ellah script origin script.sh
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

# Alias

With alias you can add bash scripts to be automatically synced between your devices .bash_profile. Get easy access to your personal aliases, functions and workflows.

example

```bash
nano git_alias.sh
```

```bash
# git_alias.sh
#!/bin/bash

alias gp="git push"
alias gpf="git push --force"
alias gadd="git add ."
gcom() {
  git commit -m "$1"
}
grebase() {
  git rebase -i HEAD~$1
}
```

Add for all your devices OS

```bash
ellah alias add git_alias.sh
```

Add this alias only for devices with Windows OS

```bash
ellah alias add git_alias.sh --os win
```

Add this alias only for devices with Mac OS

```bash
ellah alias add git_alias.sh --os unix
```

Listing your alises should now include git_alias.sh

```bash
ellah alias ls
```

Your .bash_profile now includes:

```bash
--- ELLAH START ---
source ./path/to/user/.ellah-cli/alias/git_alias.sh
--- ELLAH END ---
```

Your S3 bucket includes a folder with your alias file as alias/git_alias.sh.

Remove an alias

```bash
ellah alias rm git_alias.sh
```

## Contribution

Ellah is an open-source project, and we welcome contributions of all sorts. Whether you're fixing bugs, improving documentation, or proposing new features, your efforts are greatly appreciated. Please check out our Contribution Guidelines for detailed instructions.

## License

Ellah is licensed under the MIT license.

## Contact

For any questions, suggestions, or just to say hello, feel free to reach out at hej@jimmiem.se.
