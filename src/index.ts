import { Client, GatewayIntentBits } from "discord.js";
import commandHandler from "./utils/commandHandler";
import validateEnv from "./utils/validateEnv";
import pg from "pg";
import autocompleteHandler from "./utils/autocompleteHandler";
import chalk from "chalk";

validateEnv();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const dbClient = new pg.Client({ connectionString: process.env.DB_URL });

dbClient.connect().then(() => console.log("Connected to DB"));

client.once("ready", (client) => {
  console.log(`${chalk.yellow(client.user.tag)} logged in`);
});

client.on("interactionCreate", (i) => {
  if (!dbClient.database) return;

  if (i.isChatInputCommand()) commandHandler(i);
  else if (i.isAutocomplete()) autocompleteHandler(i);
});

client.login(process.env.BOT_TOKEN);

export { dbClient };
