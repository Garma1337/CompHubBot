const bot = require('../bot');

module.exports = {
  name: 'confirm',
  description: 'Confirm.',
  noHelp: true,
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  execute(message) {
    const { confirmations } = bot;

    const authorId = message.author.id;
    if (!confirmations.has(authorId)) {
      return message.channel.warn('You don\'t have anything to confirm!');
    }

    const userConfirmation = confirmations.get(authorId);
    if (!userConfirmation) {
      return message.channel.warn('You don\'t have anything to confirm!');
    }

    const command = userConfirmation.get('command');
    if (command) {
      userConfirmation.delete('command');
      const c = message.client.commands.get(command);
      return c.confirm(message);
    }

    return message.channel.warn('You don\'t have anything to confirm!');
  },
};
