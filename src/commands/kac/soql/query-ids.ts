import { flags, SfdxCommand } from "@salesforce/command";
import { spawn } from "child_process";
import { readFileSync } from "fs";

const ResultFormat = {
  Human: "human",
  CSV: "csv",
  JSON: "json",
};

export default class QueryIds extends SfdxCommand {
  public static description = "Query fields on record IDs provided through stdin.";

  public static args = [{ name: "sobject" }];

  protected static flagsConfig = {
    fields: flags.array({
      char: "f",
      description: "fields to query",
    }),
    resultformat: flags.string({
      char: "r",
      description:
        "result format emitted to stdout; --json flag overrides this parameter",
      options: Object.values(ResultFormat),
      default: ResultFormat.Human,
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<any> {
    const { sobject }: { sobject?: string } = this.args;
    const {
      fields,
      resultformat,
    }: { fields?: string[]; resultformat?: string } = this.flags;

    const query = `SELECT ${fields
      .map((f) => f.trim())
      .join(",")} FROM ${sobject} WHERE Id IN (${readFileSync(0, "utf-8")
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i)
      .map((i) => `'${i}'`)
      .join(",")})`;

    spawn(
      `sfdx force:data:soql:query -r ${quote(resultformat)} -q ${quote(
        query
      )} -u ${quote(this.org.getUsername())}`,
      {
        shell: true,
        stdio: "inherit",
      }
    );
  }
}

const quote = (value: string) => `"${value}"`;
