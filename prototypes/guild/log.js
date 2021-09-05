const { Guild } = require('discord.js');
const config = require('../../config');

/**
 * Logs a message in the log channel
 * @param message
 * @param noPing
 */
// eslint-disable-next-line func-names
Guild.prototype.log = function (message, noPing = false) {
  // eslint-disable-next-line max-len
  const logChannel = this.channels.cache.find((c) => c.name === config.channels.tourney_log_channel);

  if (!logChannel) {
    // eslint-disable-next-line no-console
    console.error(`Channel "${config.channels.tourney_log_channel}" does not exist.`);
    // eslint-disable-next-line no-console
    console.log(message);

    return;
  }

  if (noPing) {
    logChannel.sendWithoutPing(message);
  } else {
    logChannel.send(message);
  }
};
