import { ActivityType, Client, PresenceUpdateStatus } from 'discord.js';

export default function setBotPresence(client: Client<true>) {
  const guildCount = client.guilds.cache.size;

  client.user.setPresence({
    status: PresenceUpdateStatus.Online,
    activities: [
      {
        state: `/tezaurs | ${guildCount} serveros`,
        // @ts-ignore
        type: ActivityType.Custom,
        name: '-',
      },
    ],
  });
}
