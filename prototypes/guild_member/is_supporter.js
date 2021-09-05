const { GuildMember } = require('discord.js');
const config = require('../../config');

/**
 * Returns if a member is a supporter (donator or server booster)
 * @returns boolean
 */
// eslint-disable-next-line func-names
GuildMember.prototype.isSupporter = function () {
  return (this.hasRole(config.roles.donator_role) || this.hasRole(config.roles.nitro_booster_role));
};
