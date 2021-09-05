module.exports = {
  name: 'stop',
  description: 'STOP',
  noHelp: true,
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  execute(message) {
    // eslint-disable-next-line max-len
    if (!message.member.isAdmin() && !message.member.isBotOwner()) {
      // eslint-disable-next-line max-len
      return message.channel.warn('You should have administrator permissions to use this command!');
    }

    // eslint-disable-next-line no-param-reassign
    message.client.stop = true;
    return message.channel.success('You stopped me :slight_frown:');
  },
};
