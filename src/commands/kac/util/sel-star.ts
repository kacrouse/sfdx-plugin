import { flags, SfdxCommand } from "@salesforce/command";
import { spawn } from "child_process";

const ResultFormat = {
  Human: "human",
  CSV: "csv",
  JSON: "json",
};

export default class SelectStar extends SfdxCommand {
  public static description =
    "Query an object, selecting all fields automatically.";

  public static args = [{ name: "sobject" }];

  protected static flagsConfig = {
    where: flags.string({ char: "w", description: "where clause for query" }),
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
      where,
      resultformat,
    }: { where?: string; resultformat?: string } = this.flags;

    const conn = this.org.getConnection();
    const { fields } = await conn.sobject(sobject).describe();
    let query = `SELECT ${fields.map((f) => f.name).join(",")} FROM ${sobject}`;
    if (where) {
      query += ` WHERE ${where}`;
    }

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
