const { GuildMember } = require('discord.js');
const config = require('../../config');

/**
 * Returns if a member is the bot owner
 * @returns boolean
 */
// eslint-disable-next-line func-names
GuildMember.prototype.isBotOwner = function () {
  return config.owner === this.user.id;
};
