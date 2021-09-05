const { Player } = require('../db/models/player');

module.exports = {
  name: 'set_psn',
  description: 'Set your PSN.',
  guildOnly: true,
  cooldown: 10,
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    let PSN;
    let user;

    if (message.member.isStaff() && args.length !== 1) {
      if (args.length === 2) {
        PSN = args[1];
        // eslint-disable-next-line prefer-destructuring
        user = message.mentions.users.first();
      } else {
        user = message.author;
      }
    } else if (args.length > 1) {
      return message.channel.warn('Nope.');
    } else {
      PSN = args.shift();
      user = message.author;
    }

    if (PSN === 'ctr_tourney_bot' || PSN === 'YourPSN') {
      return message.channel.warn('You okay, bro?');
    }

    // eslint-disable-next-line consistent-return
    message.guild.members.fetch(user).then((member) => {
      const discordId = member.user.id;

      const e = 'You should specify the PSN.';
      if (!PSN) {
        return message.channel.warn(e);
      }

      // eslint-disable-next-line consistent-return
      Player.findOne({ psn: PSN }).then((repeatPSN) => {
        if (repeatPSN) {
          if (repeatPSN.discordId === message.author.id) {
            return message.channel.warn('You\'ve already set this PSN name.');
          }

          return message.channel.warn('This PSN is already used by another player.');
        }

        // eslint-disable-next-line consistent-return
        Player.findOne({ discordId }).then((doc) => {
          let promise;
          if (!doc) {
            const player = new Player();
            player.discordId = discordId;
            player.psn = PSN;
            promise = player.save();
          } else {
            if (!doc.oldPSNIDs.includes(doc.psn)) {
              doc.oldPSNIDs.push(doc.psn);
            }

            doc.psn = PSN;
            promise = doc.save();
          }

          promise.then(() => {
            message.channel.success(`PSN has been set \`${PSN}\`.`);
          });
        });
      });
    });
  },
};
