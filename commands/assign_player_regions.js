const { Player } = require('../db/models/player');
const { regions } = require('../db/regions');

module.exports = {
  name: 'assign_player_regions',
  guildOnly: true,
  noHelp: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  // eslint-disable-next-line consistent-return
  async execute(message) {
    const players = await Player.find({ flag: { $ne: null }, region: null });
    const playersWithCountry = players.filter((p) => p.flag !== '🇺🇳');
    const output = [];

    for (const p of playersWithCountry) {
      let member;

      try {
        member = await message.guild.members.fetch(p.discordId);
        // eslint-disable-next-line no-empty
      } catch (e) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const region = regions.find((r) => r.countries.includes(p.flag));

      p.region = region.key;
      await p.save();

      output.push(`Assigned region \`${region.name}\` to ${member.user.tag}.`);
    }

    if (output.length > 0) {
      return message.channel.success(`${output.join('\n')}`);
    }

    return message.channel.warn('All players already have their regions set.');
  },
};
