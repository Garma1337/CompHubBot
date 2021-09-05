const { Player } = require('../db/models/player');
const { engineStyles } = require('../db/engine_styles');

module.exports = {
  name: 'set_engine',
  description: 'Set your favorite engine style.',
  guildOnly: true,
  cooldown: 10,
  execute(message, args) {
    if (args[0] === 'unset') {
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.engineStyle = null;
        player.save().then(() => {
          message.channel.success('Your engine style has been unset.');
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });

      return;
    }

    let user;

    if (message.member.isStaff() && args.length === 1) {
      user = message.mentions.users.first();
    } else {
      user = message.author;
    }

    // eslint-disable-next-line consistent-return
    message.channel.awaitMenuChoice('Please select your engine style.', message.author.id, engineStyles, 1).then((selectedEngineStyle) => {
      const engineStyle = engineStyles.find((e) => e.key === selectedEngineStyle);
      if (!engineStyle) {
        return message.channel.warn(`The engine style ${selectedEngineStyle} does not exist.`);
      }

      Player.findOne({ discordId: user.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = user.id;
        }

        player.engineStyle = selectedEngineStyle;
        player.save().then(() => {
          if (user.id === message.author.id) {
            message.channel.success(`Your engine style has been set to ${engineStyle.emote}.`);
          } else {
            message.channel.success(`<@!${user.id}>'s engine style has been set to ${engineStyle.emote}.`);
          }
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });
    });
  },
};
