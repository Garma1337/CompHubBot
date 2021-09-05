const { Player } = require('../db/models/player');
const { consoles } = require('../db/consoles');

module.exports = {
  name: 'set_console',
  description: 'Set your consoles.',
  guildOnly: true,
  aliases: ['set_consoles', 'console_set'],
  cooldown: 10,
  execute(message, args) {
    if (args[0] === 'unset') {
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.consoles = [];
        player.save().then(() => {
          message.channel.success('Your consoles have been unset.');
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

    message.channel.awaitMenuChoice('Please select your consoles.', message.author.id, consoles, consoles.length, []).then((selection) => {
      const consoleNames = [];
      selection.forEach((s) => {
        const console = consoles.find((c) => c.key === s);
        consoleNames.push(console.name);
      });

      Player.findOne({ discordId: user.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = user.id;
          player.consoles = [];
        }

        player.consoles = selection;
        player.save().then(() => {
          if (user.id === message.author.id) {
            message.channel.success(`Your consoles have been set to \`${consoleNames.join(', ')}\`.`);
          } else {
            message.channel.success(`<@!${user.id}>'s consoles have been set to \`${consoleNames.join(', ')}\`.`);
          }
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });
    });
  },
};
