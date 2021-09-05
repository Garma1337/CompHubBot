const { Player } = require('../db/models/player');
const { regions } = require('../db/regions');

module.exports = {
  name: 'set_flag',
  description: 'Set your country flag.',
  aliases: ['set_country'],
  cooldown: 10,
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    let countryFlag;
    let user;

    if (message.member.isStaff() && args.length !== 1) {
      if (args.length === 2) {
        countryFlag = args[1];
        user = message.mentions.users.first();
      } else {
        return message.channel.warn('Nope.');
      }
    } else if (args.length > 1) {
      return message.channel.warn('Nope.');
    } else {
      countryFlag = args.shift();
      user = message.author;
    }

    // eslint-disable-next-line consistent-return
    message.guild.members.fetch(user).then((member) => {
      const discordId = member.user.id;

      const e = 'You should specify country flag. To see them all use the `!flags` command';
      if (!countryFlag) {
        return message.channel.warn(e);
      }

      const { flags } = message.client;

      if (!flags.includes(countryFlag)) {
        return message.channel.warn(e);
      }

      const region = regions.find((r) => r.countries.includes(countryFlag));
      if (!region) {
        return message.channel.warn(`The country ${countryFlag} is not assigned to a region. Please message a staff member.`);
      }

      // eslint-disable-next-line consistent-return
      Player.findOne({ discordId }).then((doc) => {
        let promise;
        if (!doc) {
          const player = new Player();
          player.discordId = discordId;
          player.flag = countryFlag;
          player.region = region.key;
          promise = player.save();
        } else {
          if (!message.member.isStaff() && doc.flag && doc.flag !== '🇺🇳') {
            return message.channel.warn(`You've already set your flag to ${doc.flag}. It cannot be changed.`);
          }

          doc.flag = countryFlag;
          doc.region = region.key;
          promise = doc.save();
        }

        promise.then(() => {
          message.channel.success(`Flag has been set to ${countryFlag}. Region has been set to \`${region.name}\`.`);
        });
      });
    });
  },
};
