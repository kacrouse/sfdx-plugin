import { flags, SfdxCommand } from "@salesforce/command";
import { QueryResult } from "jsforce";
import { table } from "table";
import logUpdate from "log-update";
import stripAnsi from "strip-ansi";
import chalk from "chalk";

const toViewableValue = (rawValue) => {
  if (rawValue && typeof rawValue === "object") {
    const { attributes, ...values } = rawValue;
    return JSON.stringify(values);
  }
  return rawValue;
};

const addStyles = (newTable, previousTable) => {
  const styledTable = [...newTable];
  if (previousTable) {
    styledTable.forEach((row, i) =>
      row.forEach((value, j) => {
        const previousValue = previousTable[i] && previousTable[i][j];
        if (stripAnsi("" + previousValue) !== stripAnsi("" + value)) {
          newTable[i][j] = chalk.black.bgYellow("" + newTable[i][j]);
        }
      })
    );
  }
  styledTable[0].map((c: string) => chalk.bold(c));
  return styledTable;
};

const toTableArray = (records) => {
  if (!records) {
    return [];
  }
  const columns = Object.keys(records[0]).filter((c) => c !== "attributes");
  const data = records.map((record) =>
    columns.map((column) => toViewableValue(record[column]))
  );
  return [columns, ...data];
};

const sleep = async (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(() => resolve(), milliseconds));

export default class Poll extends SfdxCommand {
  public static description =
    "Execute a SOQL query at the specified interval, updating the results display in place.";

  public static args = [{ name: "query" }];

  protected static flagsConfig = {
    interval: flags.integer({
      char: "i",
      description: "The interval in milliseconds at which to poll.",
      default: 1000,
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<any> {
    const { query }: { query?: string } = this.args;
    const { interval }: { interval?: number } = this.flags;

    const conn = this.org.getConnection();

    let result: QueryResult<JSON>;
    let previousTable;
    while (true) {
      try {
        result = await conn.query(query);
      } catch (e) {
        console.error(e);
        return;
      }
      if (result['records'].length === 0) {
          console.log('No records found');
          return;
      }
      const tableArray = toTableArray(result["records"]);
      const tableStr = table(addStyles(tableArray, previousTable));
      logUpdate(tableStr);
      previousTable = tableArray;
      await sleep(interval);
    }

    if (!result.done) {
      console.error("more records to retrieve... implement that");
      return;
    }
  }
}
