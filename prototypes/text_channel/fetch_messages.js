const { TextChannel } = require('discord.js');

/**
 * Fetches messages from a channel
 * @param limit
 * @returns {Promise<*[]>}
 */
// eslint-disable-next-line func-names
TextChannel.prototype.fetchMessages = async function (limit = 100) {
  let packetSize = 100;
  const messages = [];
  let lastId;

  if (packetSize > limit) {
    packetSize = limit;
  }

  while (messages.length < limit) {
    const options = { limit: packetSize };
    if (lastId) {
      options.before = lastId;
    }

    // eslint-disable-next-line no-await-in-loop
    const fetchedMessages = await this.messages.fetch(options);
    messages.push(...fetchedMessages.array());

    lastId = fetchedMessages.lastKey();

    if (fetchedMessages.size < packetSize) {
      break;
    }
  }

  return messages;
};
