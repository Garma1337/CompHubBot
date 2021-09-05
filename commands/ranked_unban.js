const config = require('../config');
const { RankedBan } = require('../db/models/ranked_ban');

module.exports = {
  name: 'ranked_unban',
  description: 'Ranked unban',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    if (args.length) {
      const argument = args.shift();
      let member = message.mentions.users.first();
      if (!member) {
        try {
          member = await message.guild.findMember(argument);
        } catch (error) {
          return message.channel.error(error.message);
        }
      }

      // eslint-disable-next-line consistent-return
      RankedBan.findOne({ guildId: message.guild.id, discordId: member.id }).then((doc) => {
        if (!doc) {
          return message.channel.warn('Banned user not found.');
        }

        const promises = [];

        const docDeletePromise = doc.delete();
        promises.push(docDeletePromise);

        // eslint-disable-next-line max-len
        const channel = message.guild.channels.cache.find((c) => c.name === config.channels.ranked_lobbies_channel);
        const permissionOverwrites = channel.permissionOverwrites.get(doc.discordId);
        if (permissionOverwrites) {
          const permissionDeletePromise = permissionOverwrites.delete();
          promises.push(permissionDeletePromise);
        }

        const msg = message.channel.info('...');

        Promise.all([msg, ...promises]).then(([m]) => {
          m.delete();
          message.channel.success(`${member} was unbanned from ranked lobbies.`);
        });
      });
    }
  },
};
