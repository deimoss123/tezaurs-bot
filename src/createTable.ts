import pg from "pg";
import format from "pg-format";
import fs from "node:fs";
import path from "node:path";
import validateEnv from "./utils/validateEnv";
import "dotenv/config";

// @ts-ignore
import XmlStream from "xml-stream";
import chalk from "chalk";

async function createTable(dbClient: pg.Client) {
  const createTableText = `
    DROP TABLE IF EXISTS words;
  
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    
    CREATE TABLE IF NOT EXISTS words (
      id TEXT PRIMARY KEY NOT NULL, 
      word TEXT NOT NULL,
      n INT NOT NULL,
      data JSONB NOT NULL
      );

    CREATE INDEX IF NOT EXISTS t_gist ON words USING gist(word gist_trgm_ops);
  `;

  await dbClient
    .query(createTableText)
    .then(() => console.log("Created table"));

  const FILE_NAME = "tezaurs_2022_tei.xml";
  const FILE_PATH = path.join(process.cwd(), FILE_NAME);

  const xml = fs.createReadStream(FILE_PATH);
  const xmlStream = new XmlStream(xml);

  const insertText =
    "INSERT INTO words(id, word, n, data) VALUES %L RETURNING *";

  let i = 0;
  let valueArr: any[] = [];

  xmlStream.collect("gram");
  xmlStream.collect("sense");
  xmlStream.collect("gramGrp");

  xmlStream.on("endElement: entry", async (item: any) => {
    valueArr.push([item.$.id, item.$.sortKey, item.$.n, item]);

    if (valueArr.length >= 1000) {
      xmlStream.pause();
      dbClient.query(format(insertText, valueArr)).then(() => {
        console.log(
          `[i=${i}] Added ${valueArr.length} items to DB (${item.$.sortKey})`
        );
        valueArr = [];
        xmlStream.resume();
      });
    }

    i++;
  });

  xmlStream.on("end", () => {
    if (valueArr.length) {
      dbClient.query(format(insertText, valueArr)).then(() => {
        console.log(`[i=${i}] Added ${valueArr.length} items to DB`);
        console.log(chalk.green("Done!"));
        process.exit(0);
      });
    }
  });
}

validateEnv();

const dbClient = new pg.Client({ connectionString: process.env.DB_URL });
dbClient.connect().then(() => {
  console.log("Connected to DB");
  createTable(dbClient);
});
