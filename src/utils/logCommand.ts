import chalk from "chalk";
import { ChatInputCommandInteraction } from "discord.js";

export default function logCommand(i: ChatInputCommandInteraction) {
  console.log(
    [
      new Date().toLocaleString("en-GB"),
      chalk.blueBright(`[${i.inCachedGuild() ? i.guild.name : "DM"}]`),
      chalk.bold(
        `${i.user.discriminator !== "0" ? i.user.tag : i.user.username}`
      ),
      chalk.gray(`(${i.user.id})`),
      i.toString().substring(1),
    ].join(" ")
  );
}
