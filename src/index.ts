import {
  ApplicationCommandOptionChoiceData,
  Client,
  GatewayIntentBits,
} from "discord.js";
import commandHandler from "./utils/commandHandler";
import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import pg from "pg";

validateEnv();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const dbClient = new pg.Client({ connectionString: process.env.DB_URL });

dbClient.connect().then(() => console.log("Connected to DB"));

client.once("ready", async (client) => {
  console.log(`${client.user.tag} logged in`);
});

client.on("interactionCreate", async (i) => {
  if (!dbClient.database) return;

  if (i.isChatInputCommand()) commandHandler(i);
  else if (i.isAutocomplete()) {
    const value = i.options.getFocused();
    if (!value) return;
    console.log(value);
    // SELECT * FROM words WHERE levenshtein(word, 'āda') < 2 ORDER BY levenshtein(word, 'āda') ASC
    // const queryStr = `
    //   SELECT id, word FROM words
    //   WHERE levenshtein(left(word, 255), $1) < 1.2
    //   ORDER BY levenshtein(left(word, 255), $1) ASC
    //   LIMIT 10
    // `;

    const queryStr2 = `
      SELECT word, id, n FROM words 
      WHERE word % $1
      ORDER BY word <-> $1 ASC, n ASC
      LIMIT 10
    `;

    const now = performance.now();
    const res = await dbClient.query(queryStr2, [value]);
    console.log(
      `Time: ${Math.floor((performance.now() - now) * 10) / 10_000}s`
    );

    if (!res.rows.length) return;

    const hasMany = new Set<string>(
      res.rows.filter(({ n }) => +n >= 2).map(({ word }) => word)
    );

    console.log(hasMany);

    const response: ApplicationCommandOptionChoiceData[] = res.rows.map(
      (row) => ({
        name: `${row.word} ${hasMany.has(row.word) ? `(${row.n})` : ""}`,
        value: row.id,
      })
    );

    console.log(res.rows.map((row) => row.word));

    i.respond(response).catch(() => {});
  }
});

client.login(process.env.BOT_TOKEN);

export { dbClient };
