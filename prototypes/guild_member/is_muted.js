const { GuildMember } = require('discord.js');
const config = require('../../config');

/**
 * Returns if a member is the bot owner
 * @returns boolean
 */
// eslint-disable-next-line func-names
GuildMember.prototype.isMuted = function () {
  return this.hasRole(config.roles.muted_role);
};
