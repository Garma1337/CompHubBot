const moment = require('moment');
const config = require('../config');
const { Lobby } = require('../db/models/lobby');
const { RankedBan } = require('../db/models/ranked_ban');

module.exports = {
  name: 'ranked_bans',
  description: 'Ranked bans',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  aliases: ['ranked_ban'],
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    if (args.length) {
      const argument = args[0];
      let member = message.mentions.users.first();
      if (!member) {
        try {
          member = await message.guild.findMember(argument);
        } catch (error) {
          return message.channel.error(error.message);
        }
      }

      let duration;
      let reason;
      if (args.length > 1) {
        const arg = args.slice(1).join(' ');
        const match = arg.match(/(\d+)\s?(\w+)/);
        if (match) {
          const inp = match[1];
          const unit = match[2];
          duration = moment.duration(inp, unit);
        }

        if (args.length > 2) {
          reason = args.slice(2).join(' ');
        }
      }

      // eslint-disable-next-line consistent-return
      RankedBan.findOne({ discordId: member.id, guildId: message.guild.id }).then((doc) => {
        if (doc) {
          return message.channel.warn('This member is already banned.');
        }

        const rb = new RankedBan();
        rb.guildId = message.guild.id;
        rb.discordId = member.id;
        rb.bannedAt = new Date();
        rb.bannedBy = message.author.id;
        rb.reason = reason;

        if (duration) {
          rb.bannedTill = moment().add(duration);
        }

        const savePromise = rb.save();

        // eslint-disable-next-line max-len
        const lobbiesChannel = message.guild.channels.cache.find((c) => c.name === config.channels.ranked_lobbies_channel);
        const overwritePromise = lobbiesChannel.createOverwrite(member, { VIEW_CHANNEL: false });

        const msg = message.channel.send('...');

        // eslint-disable-next-line max-len
        Lobby.find({ guild: message.guild.id, players: member.id, started: false }).then((docs) => {
          // eslint-disable-next-line no-shadow
          docs.forEach(async (doc) => {
            const guild = message.client.guilds.cache.get(doc.guild);
            if (guild) {
              const channel = guild.channels.cache.get(doc.channel);
              if (channel) {
                // eslint-disable-next-line no-shadow
                channel.messages.fetch(doc.message).then((msg) => {
                  if (doc.type === 'duos') {
                    const duo = doc.teamList.filter((d) => d.includes(member.id));
                    duo.forEach((d) => {
                      d.forEach((p) => {
                        msg.reactions.cache.get('✅').users.remove(p);
                      });
                    });
                  } else {
                    msg.reactions.cache.get('✅').users.remove(member.id);
                  }
                });
              }
            }
          });
        });

        Promise.all([msg, savePromise, overwritePromise]).then(([m]) => {
          let output = `${member} was banned from ranked lobbies`;
          if (duration) {
            output += ` for ${duration.humanize()}`;
          }
          output += '.';

          if (reason) {
            output += ` Reason: ${reason}.`;
          }

          m.delete();
          message.channel.success(output);
        });

        member.createDM().then((channel) => {
          let out = `Hello ${member}, you have been banned from participating in ranked lobbies`;

          if (duration) {
            out += ` for ${duration.humanize()}`;
          }

          if (reason) {
            out += ` for the following reason: ${reason}.`;
          } else {
            out += '.';
          }

          out += '\n\nIf you feel like you have been unfairly banned, please contact a staff member.';

          channel.send(out);

          const logMessage = `Sent message to ${channel.recipient}:\n\`\`\`${out}\`\`\``;
          message.guild.log(logMessage);
        }).catch(() => {
          message.channel.error(`Could not send a DM to ${member}. Make sure to let them know of their ban.`);
        });
      });
    } else {
      message.channel.info('Fetching ranked bans ...').then((m) => {
        // eslint-disable-next-line consistent-return
        RankedBan.find({ guildId: message.guild.id }).then(async (docs) => {
          m.delete();

          if (!docs.length) {
            return message.channel.info('There are no bans yet.');
          }

          const bannedMembers = [];

          message.guild.members.fetch().then((members) => {
            docs.forEach((doc, i) => {
              let out;

              const member = members.get(doc.discordId);
              if (!member) {
                out = `**${i + 1}. <@${doc.discordId}>** (left server)`;
              } else {
                out = `**${i + 1}.** ${member}`;

                let till = 'forever';
                if (doc.bannedTill) {
                  till = moment(doc.bannedTill).utc().format('YYYY-MM-DD HH:mm:ss z');
                }

                if (till !== 'forever') {
                  out += `\n**Banned until**: ${till}`;
                } else {
                  out += '\n**Banned until**: forever';
                }

                if (doc.reason) {
                  out += `\n**Reason**: ${doc.reason}\n`;
                } else {
                  out += '\n';
                }
              }

              bannedMembers.push(out);
            });

            message.channel.sendPageableContent(message.author.id, {
              outputType: 'embed',
              elements: bannedMembers,
              elementsPerPage: 10,
              embedOptions: { heading: `${bannedMembers.length} users are banned from ranked` },
            });
          });
        });
      });
    }
  },
};
