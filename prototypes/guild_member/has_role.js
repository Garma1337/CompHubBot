const { GuildMember } = require('discord.js');

/**
 * Returns if a member has a certain role
 * @param roleName
 * @returns boolean
 */
// eslint-disable-next-line func-names
GuildMember.prototype.hasRole = function (roleName) {
  const role = this.roles.cache.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
  return !!role;
};
