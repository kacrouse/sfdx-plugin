@kacrouse/sfdx-plugin
=====================

A plugin for the Salesforce CLI built by Kyle Crouse.

[![Version](https://img.shields.io/npm/v/@kacrouse/sfdx-plugin.svg)](https://npmjs.org/package/@kacrouse/sfdx-plugin)
[![CircleCI](https://circleci.com/gh/kacrouse/sfdx-plugin/tree/master.svg?style=shield)](https://circleci.com/gh/kacrouse/sfdx-plugin/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/kacrouse/sfdx-plugin?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-plugin/branch/master)
[![Codecov](https://codecov.io/gh/kacrouse/sfdx-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/kacrouse/sfdx-plugin)
[![Greenkeeper](https://badges.greenkeeper.io/kacrouse/sfdx-plugin.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/kacrouse/sfdx-plugin/badge.svg)](https://snyk.io/test/github/kacrouse/sfdx-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/@kacrouse/sfdx-plugin.svg)](https://npmjs.org/package/@kacrouse/sfdx-plugin)
[![License](https://img.shields.io/npm/l/@kacrouse/sfdx-plugin.svg)](https://github.com/kacrouse/sfdx-plugin/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g @kacrouse/sfdx-plugin
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
@kacrouse/sfdx-plugin/0.0.0 darwin-x64 node-v16.3.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx kac:apex:execute [name=value...] -f <string> [-r] [-d] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-kacapexexecute-namevalue--f-string--r--d--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx kac:soql:filter-ids [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-kacsoqlfilter-ids--f-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx kac:soql:poll [-i <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-kacsoqlpoll--i-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx kac:soql:query-ids [-f <array>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-kacsoqlquery-ids--f-array--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx kac:soql:sel-star [-w <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-kacsoqlsel-star--w-string--r-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx kac:apex:execute [name=value...] -f <string> [-r] [-d] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
Run an Apex Anonymous script, with the ability to pass in variables from the command line and read from stdin.

USAGE
  $ sfdx kac:apex:execute [name=value...] -f <string> [-r] [-d] [-u <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --debugonly                                                                   print only log lines with a category
                                                                                    of USER_DEBUG

  -f, --file=file                                                                   (required) path to a local file that
                                                                                    contains Apex code

  -r, --dryrun                                                                      print the script that will be run,
                                                                                    but do not run it

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [lib/commands/kac/apex/execute.js](https://github.com/kacrouse/sfdx-plugin/blob/v0.0.0/lib/commands/kac/apex/execute.js)_

## `sfdx kac:soql:filter-ids [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
Filter IDs provided through stdin.

USAGE
  $ sfdx kac:soql:filter-ids [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --filter=filter                                                               Filter criteria, must be a valid
                                                                                    SOQL where clause. If not provided,
                                                                                    a query will still be performed,
                                                                                    returning IDs of all records which
                                                                                    exist in the org.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [lib/commands/kac/soql/filter-ids.js](https://github.com/kacrouse/sfdx-plugin/blob/v0.0.0/lib/commands/kac/soql/filter-ids.js)_

## `sfdx kac:soql:poll [-i <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
Execute a SOQL query at the specified interval, updating the results display in place.

USAGE
  $ sfdx kac:soql:poll [-i <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --interval=interval                                                           [default: 2] The interval in seconds
                                                                                    at which to poll.

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [lib/commands/kac/soql/poll.js](https://github.com/kacrouse/sfdx-plugin/blob/v0.0.0/lib/commands/kac/soql/poll.js)_

## `sfdx kac:soql:query-ids [-f <array>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
Query fields on record IDs provided through stdin.

USAGE
  $ sfdx kac:soql:query-ids [-f <array>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --fields=fields                                                               fields to query

  -r, --resultformat=human|csv|json                                                 [default: human] result format
                                                                                    emitted to stdout; --json flag
                                                                                    overrides this parameter

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [lib/commands/kac/soql/query-ids.js](https://github.com/kacrouse/sfdx-plugin/blob/v0.0.0/lib/commands/kac/soql/query-ids.js)_

## `sfdx kac:soql:sel-star [-w <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

```
Query an object, selecting all fields automatically.

USAGE
  $ sfdx kac:soql:sel-star [-w <string>] [-r <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -r, --resultformat=human|csv|json                                                 [default: human] result format
                                                                                    emitted to stdout; --json flag
                                                                                    overrides this parameter

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --where=where                                                                 where clause for query

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation
```

_See code: [lib/commands/kac/soql/sel-star.js](https://github.com/kacrouse/sfdx-plugin/blob/v0.0.0/lib/commands/kac/soql/sel-star.js)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
