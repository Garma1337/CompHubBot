const { Guild } = require('discord.js');

/**
 * Finds a guild member
 * @param query
 * @returns {Promise<*>}
 */
// eslint-disable-next-line func-names
Guild.prototype.findMember = async function (query) {
  const members = await this.members.fetch({ query });
  if (members.size < 1) {
    throw Error('Member wasn\'t found.');
  }

  if (members.size > 1) {
    throw Error('Found more than 1 member with that name.');
  }

  return members.first();
};
