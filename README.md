besucli
=======

Besu command line features

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/besucli.svg)](https://npmjs.org/package/besucli)
[![Downloads/week](https://img.shields.io/npm/dw/besucli.svg)](https://npmjs.org/package/besucli)
[![License](https://img.shields.io/npm/l/besucli.svg)](https://github.com/abdelhamidbakhta/besucli/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g besucli
$ besucli COMMAND
running command...
$ besucli (-v|--version|version)
besucli/0.0.1 darwin-x64 node-v15.3.0
$ besucli --help [COMMAND]
USAGE
  $ besucli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`besucli help [COMMAND]`](#besucli-help-command)
* [`besucli release`](#besucli-release)

## `besucli help [COMMAND]`

display help for besucli

```
USAGE
  $ besucli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `besucli release`

create new release

```
USAGE
  $ besucli release

OPTIONS
  -b, --branch=branch    [default: master] branch to release
  -f, --force
  -h, --help             show CLI help
  -o, --owner=owner      [default: hyperledger] github owner
  -r, --repo=repo        [default: besu] github repository
  -v, --version=version  version to release
```

_See code: [src/commands/release.ts](https://github.com/abdelhamidbakhta/besucli/blob/v0.0.1/src/commands/release.ts)_
<!-- commandsstop -->
