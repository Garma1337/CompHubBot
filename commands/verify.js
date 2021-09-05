const config = require('../config');

module.exports = {
  name: 'verify',
  description: 'Player verification',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  args: true,
  usage: '[@tag]',
  aliases: ['ranked_verify'],
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    let member = message.mentions.members.first();
    if (!member) {
      try {
        member = await message.guild.findMember(args[0]);
      } catch (error) {
        return message.channel.error(error.message);
      }
    }

    const DMCallback = (m) => {
      const logMessage = `Sent message to ${m.channel.recipient}:\n\`\`\`${m.content}\`\`\``;
      message.guild.log(logMessage);
    };

    const { guild } = message;
    const role = await guild.roles.findByName(config.roles.verified_player_role);

    await member.roles.add(role);

    member.createDM().then((dm) => {
      dm.send(config.verification_dm).then((m) => {
        DMCallback(m);
      }).catch((error) => {
        message.channel.error(error.message);
      });
    });

    message.channel.success(`${member.toString()} has been verified.`);
  },
};
