const fs = require('fs');
const config = require('../config');
const { Player } = require('../db/models/player');

module.exports = {
  name: 'set_ranked_name',
  description: 'Set your ranked name.',
  guildOnly: true,
  aliases: ['set_name', 'name_set', 'ranked_name_set'],
  cooldown: 10,
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    if (args[0] === 'unset') {
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.rankedName = null;
        player.save().then(() => {
          message.channel.success('Your ranked name has been unset.');
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });

      return;
    }

    let name;
    let user;

    if (message.member.isStaff() && args.length === 2) {
      user = message.mentions.users.first();
      name = args[1];

      if (!user) {
        // eslint-disable-next-line consistent-return
        return message.channel.warn('You need to mention a user.');
      }
    } else {
      if (args.length > 1) {
        // eslint-disable-next-line consistent-return
        return message.channel.warn('The ranked name cannot contain spaces.');
      }

      user = message.author;
      name = args[0];
    }

    if (!name) {
      // eslint-disable-next-line consistent-return
      return message.channel.warn('You need to enter the desired name.');
    }

    if (name.length < 3) {
      // eslint-disable-next-line consistent-return
      return message.channel.warn('The ranked name needs to be at least 3 characters long.');
    }

    if (!name.match(/^[0-9a-zA-Z_-]+$/gi)) {
      // eslint-disable-next-line consistent-return
      return message.channel.warn('The ranked name can only consist of numbers, letters, underscore and minus.');
    }

    // eslint-disable-next-line consistent-return
    fs.readFile(config.files.badwords_file, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      const violations = [];

      if (!message.member.isStaff()) {
        const words = data.trim().split('\n');
        words.forEach((w) => {
          if (name.toLowerCase().includes(w.toLowerCase())) {
            violations.push(w);
          }
        });
      }

      if (violations.length > 0) {
        return message.channel.warn(`This name cannot be used due to using profanity. Violations: ${violations.join(', ')}`);
      }

      // eslint-disable-next-line consistent-return
      Player.findOne({ rankedName: name }).then((player) => {
        if (player) {
          if (player.discordId === user.id) {
            return message.channel.warn('You have already set this ranked name.');
          }

          return message.channel.warn('This ranked name is already used by someone else.');
        }

        // eslint-disable-next-line no-shadow,consistent-return
        Player.findOne({ discordId: user.id }).then((player) => {
          if (player.rankedName && !message.member.isStaff()) {
            return message.channel.warn('You cannot change your ranked name. Please message a staff member.');
          }

          if (!player) {
            player = new Player();
            player.discordId = message.author.id;
          }

          if (!player.oldRankedNames.includes(player.rankedName)) {
            player.oldRankedNames.push(player.rankedName);
          }

          player.rankedName = name;
          player.save().then(() => {
            if (user.id === message.author.id) {
              message.channel.success(`Your ranked name has been set to "${name}".`);
            } else {
              message.channel.success(`<@!${user.id}>'s ranked name has been set to "${name}".`);
            }
          }).catch((error) => {
            message.channel.error(`Unable to update player. Error: ${error}`);
          });
        });
      });
    });
  },
};
