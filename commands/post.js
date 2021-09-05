const Discord = require('discord.js');
const formatRoles = require('../utils/formatRoles');

module.exports = {
  name: 'post',
  description: 'Post message in channels.',
  args: true,
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  execute(message, args) {
    const { guild } = message;
    const post = formatRoles(message.content.split('\n').slice(1).join('\n'), guild.roles.cache);

    const attachment = message.attachments.first();
    const attachments = [];
    if (attachment) {
      attachments.push(attachment.url);
    }

    const promises = args.map((channelName) => {
      let channel;
      if (channelName.match(Discord.MessageMentions.CHANNELS_PATTERN)) {
        channel = message.mentions.channels.first();
      } else {
        channelName = channelName.replace(/^#/, '');
        channel = guild.channels.cache.find((c) => c.name === channelName);
      }

      if (!channel) {
        if (channelName.match(/\d\*/)) {
          const prefix = channelName[0];
          const channels = guild.channels.cache.filter((c) => c.name.startsWith(prefix));
          if (channels.size) {
            channels.cache.forEach((c) => c.send(post, { files: attachments }));
            return;
          }
        }

        // eslint-disable-next-line consistent-return
        return message.channel.warn(`Couldn't find channel ${channelName}.`);
      }

      // eslint-disable-next-line consistent-return
      return channel.send(post, { files: attachments });
    });

    Promise.all(promises).then(() => {
      message.channel.success('Done.');
    });
  },
};
