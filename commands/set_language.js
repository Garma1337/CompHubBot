const { Player } = require('../db/models/player');
const { serverLanguages } = require('../db/server_languages');

module.exports = {
  name: 'set_languages',
  description: 'Set your languages.',
  guildOnly: true,
  aliases: ['set_language', 'language_set'],
  cooldown: 10,
  execute(message, args) {
    if (args[0] === 'unset') {
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.languages = [];
        player.save().then(() => {
          message.channel.success('Your languages have been unset.');
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });

      return;
    }

    let user;

    if (message.member.isStaff() && message.mentions.users.size > 0) {
      user = message.mentions.users.first();
    } else {
      user = message.author;
    }

    message.channel.awaitMenuChoice('Please select the languages that you speak.', message.author.id, serverLanguages, 5, []).then((selection) => {
      Player.findOne({ discordId: user.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = user.id;
        }

        player.languages = selection;
        player.save().then(() => {
          if (user.id === message.author.id) {
            message.channel.success(`Your languages have been set to ${selection.join(', ')}.`);
          } else {
            message.channel.success(`<@!${user.id}>'s languages have been set to ${selection.join(', ')}.`);
          }
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });
    });
  },
};
