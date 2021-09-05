const { GuildMember } = require('discord.js');

/**
 * Returns if a member is a staff member
 * @returns boolean
 */
// eslint-disable-next-line func-names
GuildMember.prototype.isStaff = function () {
  return this.hasPermission(['MANAGE_ROLES', 'MANAGE_CHANNELS']);
};
