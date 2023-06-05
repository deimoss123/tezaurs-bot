import { ChatInputCommandInteraction } from "discord.js";
import commandList from "./commandList";

export default async function commandHandler(i: ChatInputCommandInteraction) {
  const command = commandList.find((cmd) => cmd.data.name === i.commandName);
  if (!command) return;

  // await i.deferReply();
  command.run(i);
}
