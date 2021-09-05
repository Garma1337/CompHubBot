const { Player } = require('../db/models/player');

module.exports = {
  name: 'set_color',
  description: 'Set your profile color.',
  guildOnly: true,
  aliases: ['set_profile_color', 'color_set'],
  cooldown: 10,
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    if (!message.member.isStaff() && !message.member.isSupporter()) {
      return message.channel.warn('You need to be a Donator or Server Booster to use this command.');
    }

    if (args[0] === 'unset') {
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.color = null;
        player.save().then(() => {
          message.channel.success('Your profile color has been unset.');
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });

      // eslint-disable-next-line consistent-return
      return;
    }

    let color;
    let user;

    if (message.member.isStaff() && args.length === 2) {
      user = message.mentions.users.first();
      color = parseInt(args[1], 16);

      if (!user) {
        // eslint-disable-next-line consistent-return
        return message.channel.warn('You need to mention a user.');
      }
    } else {
      user = message.author;
      color = parseInt(args[0], 16);
    }

    if (!color) {
      // eslint-disable-next-line consistent-return
      return message.channel.warn('You need to enter the desired profile color.');
    }

    // eslint-disable-next-line consistent-return
    Player.findOne({ discordId: user.id }).then((player) => {
      if (!player) {
        player = new Player();
        player.discordId = user.id;
      }

      player.color = color;
      player.save().then(() => {
        if (user.id === message.author.id) {
          message.channel.success(`Your profile color has been set to "${color}".`);
        } else {
          message.channel.success(`<@!${user.id}>'s profile color has been set to "${color}".`);
        }
      }).catch((error) => {
        message.channel.error(`Unable to update player. Error: ${error}`);
      });
    });
  },
};
