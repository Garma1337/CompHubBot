const Discord = require('discord.js');
const bot = require('../bot');
const config = require('../config');

module.exports = {
  name: 'delete_tournament_channels',
  description: 'Delete tournament channels and roles.',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  execute(message) {
    const { confirmations } = bot;

    const authorId = message.author.id;
    if (!confirmations.has(authorId)) {
      confirmations.set(authorId, new Discord.Collection());
    }

    const userConfirmation = confirmations.get(authorId);
    const autoCancelSeconds = 10;

    const confirmationCommand = userConfirmation.get('command');
    if (confirmationCommand) {
      return message.channel.warn(`You need to confirm or cancel your previous command: ${confirmationCommand}`);
    }

    message.channel.info(`This command will delete all channels in \`Tournament Lobbies\` category and all roles with the same names!
Say \`!confirm\` to proceed, \`!cancel\` to cancel.
Command will be automatically cancelled after ${autoCancelSeconds} seconds.`);
    const commandName = 'delete_tournament_channels';
    userConfirmation.set('command', commandName);

    return setTimeout(() => {
      if (userConfirmation.get('command')) {
        userConfirmation.delete('command');
        return message.channel.error(`Command \`${commandName}\` cancelled!`);
      }
      return null;
    }, autoCancelSeconds * 1000);
  },

  async confirm(message) {
    message.channel.info('Processing...').then(async (botMsg) => {
      // eslint-disable-next-line max-len
      const channels = message.guild.channels.cache.filter((c) => c.parent && c.parent.name.toLowerCase() === config.channels.tournament_lobbies_category.toLowerCase());

      const outMessageRows = [];

      for (const c of channels.array()) {
        try {
          await c.delete();
          outMessageRows.push(`Removed channel #${c.name}`);

          const roles = message.guild.roles.cache.filter((r) => r.name === c.name);

          for (const r of roles.array()) {
            try {
              await r.delete();
              outMessageRows.push(`Removing role @${c.name} ...`);
            } catch (e) {
              message.channel.error(`\`${e.name}: ${e.message}\``);
              break;
            }
          }
        } catch (e) {
          message.channel.error(`\`${e.name}: ${e.message}\``);
          break;
        }
      }

      await botMsg.delete();

      if (outMessageRows.length) {
        message.channel.success(outMessageRows.join('\n'));
      } else {
        message.channel.info('I think there is nothing to delete :slight_smile:');
      }
    });
  },
};
