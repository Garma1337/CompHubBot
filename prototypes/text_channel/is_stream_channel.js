const { TextChannel } = require('discord.js');

/**
 * Returns if a channel is a stream channel where users can link their streams
 * @returns {boolean|*}
 */
// eslint-disable-next-line func-names
TextChannel.prototype.isStreamChannel = function () {
  if (!this.name) {
    return false;
  }

  return this.name.includes('streams');
};
