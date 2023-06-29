import { ChatInputCommandInteraction } from "discord.js";
import commandList from "./commandList";
import logCommand from "./logCommand";

export default async function commandHandler(i: ChatInputCommandInteraction) {
  const command = commandList.find((cmd) => cmd.data.name === i.commandName);
  if (!command) return;

  logCommand(i);
  command.run(i);
}
