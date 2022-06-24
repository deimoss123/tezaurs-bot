import { ApplicationCommandData, CommandInteraction } from 'discord.js';

interface Command {
  data: ApplicationCommandData
  run: (i: CommandInteraction) => void
}

export default Command