const Discord = require('discord.js');
const { Clan } = require('../db/models/clan');
const { ROLE_MEMBER } = require('../db/models/clan');

const ADD = 'add';
const REMOVE = 'remove';

// eslint-disable-next-line consistent-return
const executeAction = (message, action, clan) => {
  const { channel } = message;
  const user = message.mentions.users.first();

  if (!user) {
    return message.channel.error('Invalid user.');
  }

  // eslint-disable-next-line consistent-return
  message.guild.members.fetch(user).then((member) => {
    if (!member) {
      return channel.warn(`Couldn't find the user ${member}.`);
    }

    switch (action) {
      case ADD:
        if (clan.hasMember(user.id)) {
          return channel.warn(`${member} is already a member of the clan "${clan.shortName}".`);
        }

        clan.members.push({
          role: ROLE_MEMBER,
          discordId: user.id,
        });

        clan.save().then(() => {
          channel.success(`${member} was added to the clan "${clan.shortName}".`);
        });

        break;
      case REMOVE:
        if (!clan.hasMember(user.id)) {
          return channel.warn(`${member} is not a member of the clan "${clan.shortName}".`);
        }

        clan.removeMember(user.id);
        clan.save().then(() => {
          channel.success(`${member} was removed from the clan "${clan.shortName}".`);
        });

        break;
      default:
        break;
    }
  });
};

module.exports = {
  name: 'clan_member',
  description(message) {
    if (message.member.isStaff()) {
      return `Edit clan members.
\`!clan_member add CTR @user
!clan_member remove CTR @user\``;
    }

    return `Edit clan members (Accessible for @Captain only).
\`!clan_member add @user
!clan_member remove @user\``;
  },
  guildOnly: true,
  cooldown: 10,
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    const action = args[0];
    const actions = [ADD, REMOVE];

    if (actions.includes(action)) {
      const clanName = args[1];
      const mention = args[2];

      // eslint-disable-next-line max-len
      if ((!clanName || !mention) || (mention && !mention.match(Discord.MessageMentions.USERS_PATTERN))) {
        const wrongArgumentsStaff = 'Wrong arguments. Example usage: `!clan_member add CTR @user`';
        return message.channel.warn(wrongArgumentsStaff);
      }

      // eslint-disable-next-line consistent-return
      Clan.findOne({ shortName: clanName }).then((clan) => {
        if (!clan) {
          return message.channel.warn(`There is no clan with the short name "${clanName}".`);
        }

        if (!clan.hasCaptain(message.author.id) && !message.member.isStaff()) {
          return message.channel.warn(`You are not a captain of "${clanName}".`);
        }

        executeAction(message, action, clan);
      });
    } else {
      return message.channel.warn(`The action "${action}" does not exist.`);
    }
  },
};
