import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import commandList from "./utils/commandList";
import validateEnv from "./utils/validateEnv";

validateEnv();

async function registerCommandsGuild(client: Client<true>) {
  const rest = new REST().setToken(process.env.BOT_TOKEN);

  const commands = commandList.map((cmd) => cmd.data);

  try {
    await rest
      .put(Routes.applicationCommands(client.user.id), {
        body: commands,
      })
      .then(() => console.log("User commands registered"));

    await client
      .application!.commands.set(commandList.map((cmd) => cmd.data))
      .then(() => console.log("Global commands registered"));

  } catch (error) {
    console.error(error);
  }

  process.exit(0);
}

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
bot.once("ready", registerCommandsGuild);
bot.login(process.env.BOT_TOKEN);
