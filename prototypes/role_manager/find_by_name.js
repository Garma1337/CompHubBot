const { RoleManager } = require('discord.js');

/**
 * Creates a new role and returns it
 * @param roleName
 * @param createIfNotExists
 * @returns Object
 */
// eslint-disable-next-line func-names
RoleManager.prototype.findByName = async function (roleName, createIfNotExists) {
  if (arguments.length < 2) {
    createIfNotExists = true;
  }

  const roles = await this.fetch();
  let role = roles.cache.find((r) => r.name.toLowerCase() === roleName.toLowerCase());

  if (!role && createIfNotExists) {
    role = await this.create({
      data: {
        name: roleName,
        mentionable: true,
        permissions: [],
      },
      reason: `Role ${roleName} did not exist before`,
    });
  }

  return role;
};
