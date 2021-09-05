const { Player } = require('../db/models/player');
const { hostGrades } = require('../db/host_grades');

module.exports = {
  name: 'set_host_grade',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  execute(message) {
    let user;

    if (message.mentions.users.size > 0) {
      user = message.mentions.users.first();
    } else {
      user = message.author;
    }

    message.channel.awaitMenuChoice('Please select the host grade.', message.author.id, hostGrades, 1).then((selectedHostGrade) => {
      const hostGrade = hostGrades.find((h) => h.key === selectedHostGrade);

      Player.findOne({ discordId: user.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = user.id;
        }

        player.hostGrade = selectedHostGrade;
        player.save().then(() => {
          if (user.id === message.author.id) {
            message.channel.success(`Your host grade been set to \`${hostGrade.name} (${hostGrade.description})\`.`);
          } else {
            message.channel.success(`<@!${user.id}>'s host grade has been set to \`${hostGrade.name} (${hostGrade.description})\`.`);
          }
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });
    });
  },
};
