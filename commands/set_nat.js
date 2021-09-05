const { Player } = require('../db/models/player');
const { natTypes } = require('../db/nat_types');

module.exports = {
  name: 'set_nat',
  description: 'Set your NAT type.',
  guildOnly: true,
  cooldown: 10,
  execute(message, args) {
    if (args[0] === 'unset') {
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.nat = null;
        player.save().then(() => {
          message.channel.success('Your NAT Type has been unset.');
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
    message.channel.awaitMenuChoice('Please select NAT type.', message.author.id, natTypes, 1).then((selection) => {
      const natType = natTypes.find((n) => n.key === selection);
      if (!natType) {
        return message.channel.warn(`The NAT type ${selection} does not exist.`);
      }

      Player.findOne({ discordId: user.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = user.id;
        }

        player.nat = natType.name;
        player.save().then(() => {
          if (user.id === message.author.id) {
            message.channel.success(`Your NAT type has been set to \`${natType.name}\`.`);
          } else {
            message.channel.success(`<@!${user.id}>'s NAT type has been set to \`${natType.name}\`.`);
          }
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });
    });
  },
};
