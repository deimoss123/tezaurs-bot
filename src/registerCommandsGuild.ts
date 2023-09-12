import { Client, GatewayIntentBits } from "discord.js";
import commandList from "./utils/commandList";
import chalk from "chalk";
import validateEnv from "./utils/validateEnv";

validateEnv();

async function registerCommandsGuild(client: Client) {
  const guild = client.guilds.cache.get(process.env.TEST_GUILD_ID);

  if (!guild) {
    console.log(chalk.red("Guild not found/bot isn't in the guild"));
    process.exit(1);
  }

  guild.commands.set(commandList.map((cmd) => cmd.data)).then(() => {
    console.log("Guild commands registered");
    process.exit(0);
  });
}

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
bot.once("ready", registerCommandsGuild);
bot.login(process.env.BOT_TOKEN);
