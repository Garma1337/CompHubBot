module.exports = {
  name: 'dm',
  description: 'dm',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  args: true,
  usage: '[@tag] [message]',
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    let member = message.mentions.users.first();
    if (!member) {
      try {
        member = await message.guild.findMember(args[0]);
      } catch (error) {
        return message.channel.error(error.message);
      }
    }

    const post = message.content.split(' ').slice(2).join(' ');
    const attachment = message.attachments.first();
    const attachments = [];
    if (attachment) {
      attachments.push(attachment.url);
    }

    const DMCallback = (m) => {
      const logMessage = `Sent message to ${m.channel.recipient}:\n\`\`\`${m.content}\`\`\``;
      message.guild.log(logMessage);
    };

    member.createDM().then((dm) => {
      dm.send(post, { files: attachments }).then((m) => {
        DMCallback(m);
        message.channel.success(`Message has been sent to ${member.toString()}.`);
      }).catch((error) => {
        message.channel.error(error.message);
      });
    });
  },
};
