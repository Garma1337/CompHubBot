const { Clan } = require('../db/models/clan');
const { MEMBER_ROLES } = require('../db/models/clan');

module.exports = {
  name: 'clan_role',
  usage: '[member] [clan] [role]',
  description: 'Modify the role of a clan member. Example: `!clan_role @Garma GSC captain`.',
  guildOnly: true,
  aliases: ['cr'],
  cooldown: 10,
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    if (args.length < 3) {
      return message.channel.warn('Wrong command usage. Example: `!clan_role @Garma GSC captain`.');
    }

    const user = message.mentions.users.first();

    if (!user) {
      return message.channel.warn('You need to mention a user.');
    }

    const clanName = args[1];
    const role = args[2].toLowerCase();

    // eslint-disable-next-line consistent-return
    Clan.find().then((clans) => {
      const clan = clans.find((c) => c.shortName.toLowerCase() === clanName.toLowerCase());
      if (!clan) {
        return message.channel.warn(`The clan "${clanName}" does not exist.`);
      }

      if (!clan.hasCaptain(message.author.id) && !message.member.isStaff()) {
        return message.channel.warn(`You are not a captain of "${clan}".`);
      }

      if (!clan.hasMember(user.id)) {
        return message.channel.warn(`<@!${user.id}> is not a member of "${clanName}".`);
      }

      if (!MEMBER_ROLES.includes(role)) {
        return message.channel.warn(`Invalid role "${role}". Available roles are ${MEMBER_ROLES.join(', ')}.`);
      }

      clan.setMemberRole(user.id, role);
      clan.save().then(() => message.channel.success(`Member role has been switched to ${role}.`));
    });
  },
};
