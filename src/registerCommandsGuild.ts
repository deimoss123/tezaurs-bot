import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import commandList from './utils/commandList';

dotenv.config();

async function registerCommandsGuild(client: Client) {
  const guild = await client.guilds.fetch(process.env.TEST_GUILD_ID!);
  
  await guild.commands.set(commandList.map(cmd => cmd.data)).then(() => {
    console.log('Guild commands registered');
    process.exit(0);
  });
}

const bot = new Client({ intents: [Intents.FLAGS.GUILDS] });
bot.once('ready', registerCommandsGuild);
bot.login(process.env.BOT_TOKEN);