import { CommandInteraction } from 'discord.js';
import commandList from './commandList';

export default async function commandHandler(i: CommandInteraction) {
  if (!i.guild) {
    return i.reply('Tezaura komandas var izmantot tikai serveros');
  }
  
  const command = commandList.find(cmd => cmd.data.name === i.commandName);
  if (!command) return;
  
  // await i.deferReply();
  await command.run(i);
}