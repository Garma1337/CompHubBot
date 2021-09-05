const { Player } = require('../db/models/player');

module.exports = {
  name: 'unset_flag',
  description: 'Set your country flag.',
  aliases: ['remove_country', 'remove_flag', 'unset_country'],
  cooldown: 15,
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    let discordId;

    if (message.member.isStaff()) {
      if (args.length === 1) {
        discordId = message.mentions.members.first().id;
      } else {
        discordId = message.author.id;
      }
    } else if (args.length > 0) {
      return message.channel.warn('Nope.');
    } else {
      return message.channel.warn('Nope.');
    }

    // eslint-disable-next-line consistent-return
    Player.findOne({ discordId }).then((doc) => {
      if (doc) {
        doc.flag = '🇺🇳';

        doc.save().then(() => {
          message.channel.success('Flag has been removed.');
        });
      } else {
        if (message.member.isStaff()) {
          return message.channel.warn('The user has no flag.');
        }

        return message.channel.warn('You have no flag.');
      }
    });
  },
};
