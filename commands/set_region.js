const { Player } = require('../db/models/player');
const { regions } = require('../db/regions');

module.exports = {
  name: 'set_region',
  usage: '@user',
  description: 'Set your region.',
  guildOnly: true,
  cooldown: 10,
  execute(message, args) {
    let user;

    if (message.member.isStaff() && args.length === 1) {
      user = message.mentions.users.first();
    } else {
      user = message.author;
    }

    Player.findOne({ discordId: user.id }).then((player) => {
      if (!player) {
        player = new Player();
        player.discordId = user.id;
        player.region = null;
      }

      if (player.region && !message.member.isStaff()) {
        return message.channel.warn('You cannot change your region. Please message a staff member.');
      }

      const options = regions.filter((r) => r.profileEnabled);
      // eslint-disable-next-line consistent-return
      return message.channel.awaitMenuChoice('Please select your region.', message.author.id, options, 1).then((selection) => {
        const region = options.find((r) => r.key === selection);
        if (!region) {
          return message.channel.warn(`The region ${selection} does not exist.`);
        }

        player.region = region.key;
        player.save().then(() => {
          if (user.id === message.author.id) {
            message.channel.success(`Your region has been set to \`${region.name}\`.`);
          } else {
            message.channel.success(`<@!${user.id}>'s region has been set to \`${region.name}\`.`);
          }
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });
    });
  },
};
