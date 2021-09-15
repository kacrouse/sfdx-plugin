import { flags, SfdxCommand } from "@salesforce/command";
import { readFileSync } from "fs";
import { QueryResult } from "jsforce";

export default class FilterIds extends SfdxCommand {
  public static description = "Filter IDs provided through stdin.";

  public static args = [{ name: "sobject" }];

  protected static flagsConfig = {
    filter: flags.string({
      char: "f",
      description:
        "Filter criteria, must be a valid SOQL where clause. If not provided, a query will still be performed, returning IDs of all records which exist in the org.",
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<any> {
    const { sobject }: { sobject?: string } = this.args;
    const { filter }: { filter?: string } = this.flags;

    const conn = this.org.getConnection();
    let query = `SELECT Id FROM ${sobject} WHERE Id IN (${readFileSync(
      0,
      "utf-8"
    )
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i)
      .map((i) => `'${i}'`)
      .join(",")})`;
    if (filter) {
      query += ` AND (${filter})`;
    }

    let result: QueryResult<JSON>;
    try {
      result = await conn.query(query);
    } catch (e) {
      console.error(e);
      return;
    }

    if (!result.done) {
      console.error("more records to retrieve... implement that");
      return;
    }

    result.records.forEach((r) => console.log(r['Id']));
  }
}
