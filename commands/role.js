module.exports = {
  name: 'role',
  description: 'Add role to members.',
  args: true,
  usage: '<role> [remove]\n<users>',
  guildOnly: true,
  permissions: ['MANAGE_ROLES'],
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    let roleName = args.join(' ');
    let remove = false;
    if (args[0] === 'remove') {
      remove = true;
      roleName = args.slice(1).join(' ');
    }

    // eslint-disable-next-line max-len
    const role = message.guild.roles.cache.find((r) => r.name.toLowerCase() === roleName.toLowerCase());

    async function addRole(member) {
      const userTag = member.user.tag;
      if (!member.roles.cache.some((r) => r.name === roleName)) {
        await member.roles.add(role);
        return `Added role ${role} to \`${userTag}\``;
      }

      return `\`${userTag}\` already has a role ${role}`;
    }

    async function removeRole(member) {
      const userTag = member.user.tag;
      if (!member.roles.cache.some((r) => r.name === roleName)) {
        return `\`${userTag}\` doesn't have a role ${role}`;
      }

      await member.roles.remove(role);
      return `Removed role ${role} fom \`${userTag}\``;
    }

    if (!role) {
      return message.channel.warn(`Role ${roleName} not found!`);
    }

    let rows = message.content.split('\n');
    rows = rows.slice(1);

    message.channel.info('...').then((m) => {
      message.guild.members.fetch().then(async (members) => {
        const out = [];
        // noinspection LoopStatementThatDoesntLoopJS
        for (const q of rows) {
          // eslint-disable-next-line no-shadow
          const member = members.find((m) => m.user.tag === q || m.user.id === q);

          if (!member) {
            out.push(`Couldn't find \`${q}\``);
            // eslint-disable-next-line no-continue
            continue;
          }

          let result;
          if (remove) {
            result = await removeRole(member);
          }

          result = await addRole(member);
          out.push(result);
        }

        m.delete();

        return message.channel.info(out.join('\n'));
      });
    });
  },
};
