const { GuildMember } = require('discord.js');
const config = require('../../config');

/**
 * Returns if a member is an admin (either by role or by permission)
 * @returns boolean
 */
// eslint-disable-next-line func-names
GuildMember.prototype.isAdmin = function () {
  // eslint-disable-next-line max-len
  const adminRole = this.hasRole(config.roles.admin_role);
  const adminPermission = this.hasPermission(['ADMINISTRATOR']);

  return (!!adminRole || adminPermission);
};
