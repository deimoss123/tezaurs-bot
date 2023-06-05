import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from "discord.js";

interface Command {
  data: ChatInputApplicationCommandData;
  run: (i: ChatInputCommandInteraction) => void;
}

export default Command;
