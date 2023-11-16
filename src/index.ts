import { Client, GatewayIntentBits } from 'discord.js';
import commandHandler from './utils/commandHandler';
import validateEnv from './utils/validateEnv';
import pg from 'pg';
import autocompleteHandler from './utils/autocompleteHandler';
import chalk from 'chalk';
import setBotPresence from './utils/setBotPresence';

validateEnv();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const dbClient = new pg.Client({ connectionString: process.env.DB_URL });

dbClient.connect().then(() => console.log('Connected to DB'));

client.once('ready', bot => {
  console.log(`${chalk.yellow(bot.user.tag)} logged in`);

  setBotPresence(bot);
  setInterval(() => setBotPresence(bot), 3_600_000);
});

client.on('interactionCreate', i => {
  if (!dbClient.database) return;

  if (i.isChatInputCommand()) commandHandler(i);
  else if (i.isAutocomplete()) autocompleteHandler(i);
});

client.login(process.env.BOT_TOKEN);

export { dbClient };
