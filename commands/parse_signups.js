const { SignupsChannel } = require('../db/models/signups_channel');

module.exports = {
  name: 'parse_signups',
  description: 'Parsing signups',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    const { guild } = message;

    if (!args.length) {
      return message.channel.warn('You should specify the channel.');
    }

    let channel;
    if (message.mentions.channels.size) {
      channel = message.mentions.channels.first();
    } else {
      const channelName = args[0];
      channel = guild.channels.cache.find((c) => c.name === channelName);
    }

    const doc = await SignupsChannel.findOne({ guild: message.guild.id, channel: channel.id });
    if (!doc) {
      return message.channel.warn('This channel is not defined as signups channel. Use `!signups_channels` command.');
    }

    const data = await channel.parseSignups(doc);

    const txt = data.rows.join('\n');
    message.channel.send(`${data.count} signups\n${data.hosts} hosts`, {
      files: [{
        attachment: Buffer.from(txt, 'utf-8'),
        name: 'signups.csv',
      }],
    });
  },
};
