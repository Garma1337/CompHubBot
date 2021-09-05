module.exports = {
  name: 'livestreams',
  guildOnly: true,
  cooldown: 30,
  execute(message) {
    const members = message.channel.guild.members.cache;
    const liveStreams = [];

    members.forEach((m) => {
      const userId = m.user.id;
      const presence = m.guild.presences.cache.find((p, i) => i === userId);

      if (!presence) {
        return;
      }

      for (const activity of presence.activities) {
        if (activity.isCTRStream()) {
          liveStreams.push({
            userId,
            url: activity.url,
            title: activity.details,
            game: activity.state,
          });

          break;
        }
      }
    });

    if (liveStreams.length <= 0) {
      return message.channel.info('There are currently no CTR livestreams.');
    }

    const format = (l) => `<@!${l.userId}> is now streaming \`${l.title}\`\nWatch their stream live at <${l.url}>`;
    message.channel.info('Generating stream list ...').then((m) => {
      m.delete();

      message.channel.success(liveStreams.map(format).join('\n\n'));
    });

    return true;
  },
};
