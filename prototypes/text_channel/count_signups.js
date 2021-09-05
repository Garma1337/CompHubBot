const { TextChannel } = require('discord.js');

/**
 * Counts the number of a signups inside a signups channel
 * @returns {Promise<number>}
 */
// eslint-disable-next-line func-names
TextChannel.prototype.countSignups = async function () {
  const messages = await this.fetchMessages(500);
  const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  return sortedMessages.filter((m, index) => (index > 0 && m.type !== 'PINS_ADD' && !m.author.bot)).length;
};
