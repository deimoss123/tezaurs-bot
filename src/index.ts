import dotenv from 'dotenv';
import { Client, Intents } from 'discord.js';
import commandHandler from './utils/commandHandler';

dotenv.config();

const bot = new Client({ intents: [Intents.FLAGS.GUILDS] });

bot.once('ready', async client => {
  console.log(`${client.user.tag} logged in`);
});

bot.on('interactionCreate', async i => {
  if (i.isCommand()) await commandHandler(i);
});

bot.login(process.env.BOT_TOKEN);