const { Player } = require('../db/models/player');
const { timeZones } = require('../db/time_zones');

module.exports = {
  name: 'set_time_zone',
  description: 'Set your time zone.',
  guildOnly: true,
  aliases: ['set_tz'],
  cooldown: 10,
  execute(message) {
    const regions = Object.keys(timeZones);

    return message.channel.info(`Please select your region. Waiting 1 minute.\n
\`\`\`${regions.map((r, i) => `${i + 1} - ${r}`).join('\n')}\`\`\``).then((confirmMessage) => {
      const filter = (m) => m.author.id === message.author.id;
      const options = { max: 1, time: 60000, errors: ['time'] };

      // eslint-disable-next-line consistent-return
      message.channel.awaitMessages(filter, options).then((collectedMessages) => {
        const collectedMessage = collectedMessages.first();
        const { content } = collectedMessage;

        confirmMessage.delete();
        collectedMessage.delete();

        const region = regions[content - 1] || null;
        if (region) {
          const regionTimeZones = timeZones[region];

          return message.channel.info(`Please select your time zone. Waiting 1 minute.\n
\`\`\`${regionTimeZones.map((t, i) => `${i + 1} - ${t}`).join('\n')}\`\`\``).then((confirmMessage) => {
            // eslint-disable-next-line no-shadow
            message.channel.awaitMessages(filter, options).then((collectedMessages) => {
              // eslint-disable-next-line no-shadow
              const collectedMessage = collectedMessages.first();
              // eslint-disable-next-line no-shadow
              const { content } = collectedMessage;

              confirmMessage.delete();
              collectedMessage.delete();

              const timeZone = regionTimeZones[content - 1] || null;

              if (timeZone) {
                Player.findOne({ discordId: message.author.id }).then((player) => {
                  if (!player) {
                    player = new Player();
                    player.discordId = message.author.id;
                  }

                  player.timeZone = timeZone;
                  player.save().then(() => {
                    message.channel.success(`Your time zone has been set to \`${timeZone}\`.`);
                  }).catch((error) => {
                    message.channel.error(`Unable to update player. Error: ${error}`);
                  });
                });
              } else {
                message.channel.error('Command cancelled.');
              }
            });
          }).catch(() => message.channel.error('Command cancelled.'));
        }
        message.channel.error('Command cancelled.');
      });
    }).catch(() => message.channel.error('Command cancelled.'));
  },
};
