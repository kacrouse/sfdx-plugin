import { flags, SfdxCommand } from "@salesforce/command";
import { JsonMap } from "@salesforce/ts-types";
import { SfdxError } from "@salesforce/core";
import { spawnSync } from "child_process";
import { promises as fs } from "fs";
import { withFile } from "tmp-promise";
import getStdin from "get-stdin";

type SfdxApexExecuteResult =
  | SfdxApexExecuteSuccess
  | SfdxApexExecuteCompileError
  | SfdxApexExecuteException;

interface SfdxApexExecuteSuccess {
  status: number;
  result: {
    success: true;
    compiled: true;
    logs: string;
  };
}

interface SfdxApexExecuteCompileError {
  status: number;
  result: {
    compiled: false;
    compileProblem: string;
    line: number;
    column: number;
    logs: string;
  };
}

interface SfdxApexExecuteException {
  status: number;
  result: {
    success: false;
    compiled: true;
    exceptionMessage: string;
    exceptionStackTrace: string;
    logs: string;
  };
}

// todo: there's probably more cleaning to do
const sanitize = (text: string) =>
  text?.replaceAll("'", "\\'").replaceAll("\n", "\\n");
const contextVarsApex = (stdin: string, args: JsonMap) =>
  `final Map<String, String> args = (Map<String, String>) JSON.deserialize('${sanitize(
    JSON.stringify(args)
  )}', Map<String, String>.class);\nfinal String stdin = '${sanitize(stdin)}';`;
const addContext = (context: string, script: string) => `${context}\n${script}`;
const countLines = (text: string) => text.split("\n").length;
const debugOnly = (log: string) =>
  log
    // debug statements can have newlines in them so this craziness is required
    // ?= is a positive lookahead, so it asserts that the timestamp is at the
    // beginning of the line, but does not include the timestamp in the separator
    .split(/\n(?=\d{2}:\d{2}:\d{2}\.\d{1,3} \(\d+\)\|)/)
    .filter((line) => /\|USER_DEBUG\|/.test(line))
    // grab the debug portion, unescape pipe chars
    .map((line) => line.split("|")[4].replaceAll("&#124;", "|"))
    .join("\n");

export default class ExecuteApex extends SfdxCommand {
  public static description =
    "Run an Apex Anonymous script, with the ability to pass in variables from the command line and read from stdin. stdin can be accessed in the script via a String variable named `stdin`. Arguments can be accessed via a Map<String, String>  variable named `args`.";

  static varargs = true;

  protected static flagsConfig = {
    file: flags.string({
      char: "f",
      required: true,
      description: "path to a local file that contains Apex code",
    }),
    dryrun: flags.boolean({
      char: "r",
      default: false,
      description: "print the script that will be run, but do not run it",
    }),
    debugonly: flags.boolean({
      char: "d",
      default: false,
      description: "print only log lines with a category of USER_DEBUG",
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<any> {
    const {
      file,
      dryrun,
      debugonly,
    }: { file?: string; dryrun?: boolean; debugonly?: boolean } = this.flags;

    // todo: handle errors with reading file
    const contextVars = contextVarsApex(
      (await getStdin()) || "",
      this.varargs || {}
    );
    const decoratedScript = addContext(
      contextVars,
      await fs.readFile(file, "utf8")
    );
    if (dryrun) {
      console.log(decoratedScript);
      return;
    }

    const scriptOutput = await withFile(async ({ path }) => {
      // todo: handle errors with writing file
      await fs.writeFile(path, decoratedScript);
      return spawnSync(
        `sfdx force:apex:execute -f ${path} -u ${this.org.getUsername()} --json`,
        {
          shell: true,
        }
      );
    });
    if (scriptOutput.error) {
      throw new SfdxError(scriptOutput.error.message);
    }
    const executeResult = JSON.parse(
      scriptOutput.stdout.toString()
    ) as SfdxApexExecuteResult;
    const result = executeResult.result;
    if (result.compiled == false) {
      throw new SfdxError(
        `Compile error: ${result.compileProblem} | Ln ${
          result.line - countLines(contextVars)
        }, Col ${result.column}`
      );
    }
    if (result.success === false) {
      throw new SfdxError(
        result.exceptionMessage + "\n" + result.exceptionStackTrace
      );
    }
    const output = debugonly ? debugOnly(result.logs) : result.logs;
    console.log(output);
  }
}
