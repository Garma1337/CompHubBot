const { GuildMember } = require('discord.js');
const config = require('../../config');

/**
 * Returns if a member is a verified player
 * @returns boolean
 */
// eslint-disable-next-line func-names
GuildMember.prototype.isVerifiedPlayer = function () {
  return this.hasRole(config.roles.verified_player_role);
};
