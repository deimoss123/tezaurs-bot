import { Client, GatewayIntentBits } from "discord.js";
import commandList from "./utils/commandList";
import validateEnv from "./utils/validateEnv";

validateEnv();

async function registerCommandsGuild(client: Client) {
  await client
    .application!.commands.set(commandList.map((cmd) => cmd.data))
    .then(() => {
      console.log("Global commands registered");
      process.exit(0);
    });
}

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
bot.once("ready", registerCommandsGuild);
bot.login(process.env.BOT_TOKEN);
