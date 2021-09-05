const { SignupsChannel } = require('../db/models/signups_channel');
const { parse } = require('../utils/signups_parsers');
const { parsers } = require('../utils/signups_parsers');

module.exports = {
  name: 'react_signups',
  description: 'Check and react on every signup message again.',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    if (!args.length) {
      return message.channel.warn('You should specify the channel.');
    }

    let channel;
    if (message.mentions.channels.size) {
      channel = message.mentions.channels.first();
    } else {
      const channelName = args[0];
      channel = message.guild.channels.cache.find((c) => c.name === channelName);
    }

    let parser;
    const doc = await SignupsChannel.findOne({ guild: message.guild.id, channel: channel.id });
    if (doc) {
      parser = parsers[doc.parser];
    } else {
      return message.channel.warn('This channel is not defined as signups channel. Use `!signups_channels` command.');
    }

    message.channel.info('Processing...').then((alert) => {
      alert.delete();

      channel.fetchMessages(500).then((messages) => {
        const promises = messages.map((m) => {
          if (m.type === 'PINS_ADD' || m.author.bot) {
            return;
          }

          m.reactions.cache.forEach((reaction) => {
            if (reaction.me) {
              reaction.remove();
            }
          });

          const data = parse(m, parser.fields);

          const reactionCatchCallback = () => {
            m.guild.log(`Couldn't react to the message by ${m.author}.`);
          };

          if (!data.errors.length) {
            // eslint-disable-next-line consistent-return
            return m.react('✅').then().catch(reactionCatchCallback);
          }

          // eslint-disable-next-line consistent-return
          return m.react('❌').then().catch(reactionCatchCallback);
        });

        Promise.all(promises).then(() => {
          alert.delete();
          message.channel.success('Done.');
        });
      });
    });
  },
};
