const { TextChannel } = require('discord.js');

/**
 * Sends a message without pinging anyone
 * @param message
 * @return Promise
 */
// eslint-disable-next-line func-names
TextChannel.prototype.sendWithoutPing = function (message) {
  return this.send('...').then((m) => m.edit(message));
};
