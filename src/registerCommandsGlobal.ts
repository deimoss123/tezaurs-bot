import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import commandList from './utils/commandList';

dotenv.config();

async function registerCommandsGuild(client: Client) {
  await client.application!.commands.set(commandList.map(cmd => cmd.data)).then(() => {
    console.log('Global commands registered');
    process.exit(0);
  });
}

const bot = new Client({ intents: [Intents.FLAGS.GUILDS] });
bot.once('ready', registerCommandsGuild);
bot.login(process.env.BOT_TOKEN);