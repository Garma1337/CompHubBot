const { GuildMember } = require('discord.js');

/**
 * Returns if a member is the server owner
 * @returns boolean
 */
// eslint-disable-next-line func-names
GuildMember.prototype.isServerOwner = function () {
  return this.guild.ownerID === this.user.id;
};
