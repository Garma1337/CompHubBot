/* eslint-disable consistent-return */
require('./prototypes');
require('log-timestamp');
const axios = require('axios');
const util = require('util');
const fs = require('fs');
const Discord = require('discord.js');
const moment = require('moment');
const { CronJob } = require('cron');
const disbut = require('discord-buttons');
const config = require('./config');
const { Clan } = require('./db/models/clan');
const { Command } = require('./db/models/command');
const { CommandUsage } = require('./db/models/command_usage');
const { Config } = require('./db/models/config');
const { Cooldown } = require('./db/models/cooldown');
const { Mute } = require('./db/models/mute');
const { Player } = require('./db/models/player');
const { SignupsChannel } = require('./db/models/signups_channel');
const alarms = require('./alarms');
const getConfigValue = require('./utils/getConfigValue');
const db = require('./db/models');
const { parsers, parse, checkRepetitions } = require('./utils/signups_parsers');
const { flags } = require('./db/flags');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
module.exports.client = client;

client.prefix = config.prefix;
client.flags = flags;
client.commands = new Discord.Collection();
client.getEmote = (name, id) => `<:${name}:${id}>`;

disbut(client);

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

const cooldowns = new Discord.Collection();

// eslint-disable-next-line import/prefer-default-export
const confirmations = new Discord.Collection();
module.exports.confirmations = confirmations;

const setSignupsCountTopic = (channel) => {
  channel.countSignups().then((count) => {
    channel.edit({ topic: `${count} signups` });
  });
};

client.on('ready', () => {
  const { guilds } = client;
  alarms(client);

  guilds.cache.forEach((guild) => {
    SignupsChannel.find({ guild: guild.id }).then((docs) => {
      const channels = docs.map((d) => d.channel);
      const channelsToFetch = guild.channels.cache.filter((c) => channels.includes(c.id));
      channelsToFetch.forEach((channel) => {
        setSignupsCountTopic(channel); // it also fetches last 500 messages
      });
    });
  });

  const setConfigActivity = () => {
    Config.findOne({ name: 'status' }).then(async (doc) => {
      if (doc) {
        const { activities } = client.user.presence;
        if (activities.length) {
          if (activities.shift().name === doc.value) {
            return;
          }
        }

        await client.user.setActivity(doc.value);
      } else {
        const conf = new Config();
        conf.name = 'status';
        conf.value = '';
        conf.save().then();
      }
    });
  };

  setConfigActivity();
});

client.on('rateLimit', (rateLimitData) => {
  // eslint-disable-next-line no-console
  console.log('rateLimit');
  // eslint-disable-next-line no-console
  console.log(rateLimitData);
});

// joined a server
client.on('guildCreate', (guild) => {
  const channel = guild.channels.cache.find((c) => c.name === config.channels.main_channel);
  channel.send('Hi guys! :slight_smile:');
});

async function reactOnSignUp(message, oldMessage = null) {
  try {
    if (message.type === 'PINS_ADD') {
      return;
    }

    // eslint-disable-next-line max-len
    const signupsChannel = await SignupsChannel.findOne({ guild: message.channel.guild.id, channel: message.channel.id });
    if (!signupsChannel) {
      return;
    }

    const parser = parsers[signupsChannel.parser];

    if (!parser) {
      return;
    }

    const { channel } = message;
    setSignupsCountTopic(channel);

    const data = parse(message, parser.fields);

    const DMCallback = (m, result) => {
      let logMessage = `Sent message to ${m.channel.recipient}:\n\`\`\`${m.content}\`\`\``;
      if (result.errors && result.errors.length) {
        logMessage += `Errors:\n\`\`\`json\n${JSON.stringify(result.errors, null, 2)}\n\`\`\``;
      }

      message.guild.log(logMessage);
    };

    const DMCatchCallback = (error) => {
      const logMessage = `${error.message} ${message.author}`;
      message.guild.log(logMessage);
    };

    const reactionCatchCallback = () => {
      message.guild.log(`Couldn't react to the message by ${message.author}.`);
    };

    const { reactions } = message;
    reactions.cache.forEach((r) => {
      if (r.me) {
        r.remove();
      }

      if (r.emoji.name === '✅' || r.emoji.name === '❌') {
        r.users.fetch().then((users) => {
          users.forEach((reactionUser) => {
            if (reactionUser.id !== client.user.id) {
              // eslint-disable-next-line no-console
              r.users.remove(reactionUser).then().catch(console.error);
            }
          });
        });
      }
    });

    if (data.errors && data.errors.length) {
      message.react('❌').then().catch(reactionCatchCallback);
      message.author.send(`Your signup is wrong. Please, be sure to follow the template (pinned message)!
You can edit your message, and I will check it again.`).then((m) => DMCallback(m, data)).catch(DMCatchCallback);
    } else {
      // eslint-disable-next-line max-len
      checkRepetitions(message, data, parser.fields, (m) => parse(m, parser.fields)).then((result) => {
        if (result && result.errors && !result.errors.length) {
          message.react('✅').then().catch(reactionCatchCallback);
          // eslint-disable-next-line max-len
          message.author.send(signupsChannel.message).then((m) => DMCallback(m, result)).catch(DMCatchCallback);
        } else {
          message.react('❌').then().catch(reactionCatchCallback);
          message.author.send('Your signup is wrong. Please, contact Staff members.').then((m) => DMCallback(m, result)).catch(DMCatchCallback);
        }
      });
    }

    if (oldMessage) {
      const msg = `Signup by ${message.author} was edited

**Old message:**
${oldMessage.content}
**New Message:**
${message.content}`;
      message.guild.log(msg, true);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

client.on('messageReactionAdd', (reaction) => {
  // eslint-disable-next-line max-len
  client.channels.cache.get(reaction.message.channel.id).messages.fetch(reaction.message.id).then((message) => {
    if (message.channel.type !== 'text') {
      return;
    }

    // eslint-disable-next-line max-len
    if (message.channel.name.toLowerCase() === config.channels.suggestions_channel.toLowerCase() && !message.author.bot) {
      if (['✅', '❌'].includes(reaction.emoji.name)) {
        const likeReaction = message.reactions.cache.find((r) => r.emoji.name === '👍');
        const dislikeReaction = message.reactions.cache.find((r) => r.emoji.name === '👎');

        likeReaction.users.fetch({ limit: 100 }).then((likeUsers) => {
          let likes = likeUsers.size - 1;
          if (likes < 0) {
            likes = 0;
          }

          dislikeReaction.users.fetch({ limit: 100 }).then((dislikeUsers) => {
            let dislikes = dislikeUsers.size - 1;

            if (dislikes < 0) {
              dislikes = 0;
            }

            reaction.users.fetch({ limit: 100 }).then((reactionUsers) => {
              const user = reactionUsers.first();

              let avatarUrl;
              let color;
              let title;

              if (user.avatar) {
                avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
              } else {
                avatarUrl = user.defaultAvatarURL;
              }

              if (reaction.emoji.name === '✅') {
                title = `${user.username}#${user.discriminator} approved a suggestion by ${message.author.username}#${message.author.discriminator}`;
                color = 7844437;
              } else {
                title = `${user.username}#${user.discriminator} denied a suggestion by ${message.author.username}#${message.author.discriminator}`;
                color = 12458289;
              }

              const embed = {
                color,
                author: {
                  name: title,
                  icon_url: avatarUrl,
                },
                description: `\`\`\`${message.content}\`\`\`\n**Likes**: ${likes}\n**Dislikes**: ${dislikes}`,
              };

              message.delete().then(() => {
                message.channel.send({ embed }).then();
              });
            });
          });
        });
      }

      return;
    }

    if (!message.channel.name.includes('signups')) {
      return;
    }

    const { reactions } = message;
    reactions.cache.forEach((r) => {
      if (['✅', '❌'].includes(r.emoji.name)) {
        r.users.fetch({ limit: 100 }).then((users) => {
          users.forEach((reactionUser) => {
            if (reactionUser.id !== config.bot_user_id) {
              r.users.remove(reactionUser).then().catch(() => {});
            }
          });
        });
      }
    });
  });
});

function checkPings(message) {
  if (message.author.bot || message.channel.type !== 'text') {
    return;
  }

  const { member } = message;
  if (message.member.isStaff()) {
    return;
  }

  const { roles } = message.mentions;
  const now = new Date();
  const { guild } = message;

  if (roles.size > 0) {
    Cooldown.findOneAndUpdate(
      { guildId: guild.id, discordId: message.author.id, name: 'pings' },
      { $inc: { count: 1 }, $set: { updatedAt: now } },
      { upsert: true, new: true },
    ).then(async (doc) => {
      let muteThreshold;
      let warnThreshold;

      if (member.isSupporter()) {
        muteThreshold = 5;
        warnThreshold = 4;
      } else {
        muteThreshold = 3;
        warnThreshold = 2;
      }

      const muteDuration = moment.duration(1, 'h');

      if (doc.count >= muteThreshold) {
        await member.mute(muteDuration);
        message.channel.info(`You have been muted for ${muteDuration.humanize()}.`, [member.user.id]);
      } else if (doc.count >= warnThreshold) {
        message.channel.warn(`Please don't ping people so often, or I will have to mute you for ${muteDuration.humanize()}.`, [member.id]);
      }
    });
  }
}

client.on('message', (message) => {
  if (!message || message.author.bot) {
    return;
  }

  if (message.channel.type === 'text') {
    checkPings(message);
    reactOnSignUp(message).then();

    if (message.channel.isStreamChannel()) {
      setTimeout(() => {
        message.suppressEmbeds(true).then();
      }, 1000);
    }

    if (message.content.toLowerCase() === 'bad bot') {
      message.member.mute(moment.duration('1', 'm')).then(() => {
        message.channel.send(':slight_smile:').then();
      });
    }
  }

  const { prefix } = client;

  if (message.channel.type === 'text' && message.channel.name.toLowerCase() === config.channels.suggestions_channel.toLowerCase() && !message.author.bot) {
    message.react('👍').then();
    message.react('👎').then();
  }

  if (!message.content.startsWith(prefix)) {
    return;
  }

  if (client.stop) {
    return message.channel.warn('I\'m turned off :slight_frown:');
  }

  let allowedChannels = [];

  if (message.channel.type === 'text') {
    allowedChannels = message.guild.channels.cache.filter((c) => {
      const channels = config.channels.commands_allowed;
      return channels.includes(c.name) || c.name.match(/^lobby-room-[0-9]{1,2}/i);
    }).sort((a, b) => a.rawPosition - b.rawPosition);
  }

  const firstRow = message.content.split('\n')[0];
  const args = firstRow.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  // eslint-disable-next-line max-len
  const botSpam = message.guild.channels.cache.find((c) => c.name.toLowerCase() === config.channels.spam_channel);

  if (!command) {
    Command.findOne({ name: commandName }).then((cmd) => {
      if (!cmd) {
        return message.channel.warn(`The command \`!${commandName}\` does not exist.`);
      }

      // eslint-disable-next-line max-len
      if (!message.member.isStaff() && !allowedChannels.find((c) => c.name === message.channel.name)) {
        return message.channel.warn(`You cannot use commands in this channel. Head over to ${botSpam} and use the command there.`);
      }

      message.channel.send(cmd.message);
    });

    return;
  }

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.channel.warn('You cannot use commands inside DMs. Please head over to #bot-spam and use the command there.');
  }

  if (!message.member.isStaff() && !allowedChannels.find((c) => c.name === message.channel.name)) {
    return message.channel.warn(`You cannot use commands in this channel. Head over to ${botSpam} and use the command there.`);
  }

  if (command.permissions && !(message.member && message.member.isStaff())) {
    return message.channel.warn('You don\'t have permission to use this command.');
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\n\nThe proper usage would be:\n\`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.warn(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  let cooldownAmount = (command.cooldown || 1) * 1000;

  /* reduced cooldown by 75% for supporters */
  if (message.member.isSupporter()) {
    cooldownAmount = Math.ceil(cooldownAmount * 0.25);
  }

  if (!message.member.isStaff() && cooldownAmount && timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.channel.warn(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  if (message.channel.type === 'text') {
    const { author } = message;
    message.guild.log(`**${author.username}#${author.discriminator}** used command in the ${message.channel}
\`\`\`${message.content}\`\`\``);
  }

  function catchExecutionError(error) {
    // eslint-disable-next-line no-console
    console.error(error);
    message.channel.error(`There was an error trying to execute that command!\n\n${error}`);
  }

  try {
    if (util.types.isAsyncFunction(command.execute)) {
      command.execute(message, args).catch(catchExecutionError);
    } else {
      command.execute(message, args);
    }

    const commandUsage = new CommandUsage();
    commandUsage.name = command.name;
    commandUsage.args = args;
    commandUsage.discordId = message.author.id;
    commandUsage.date = new Date();

    commandUsage.save().then();
  } catch (error) {
    catchExecutionError(error);
  }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  if (newMessage.type !== 'DEFAULT') {
    return;
  }

  if (newMessage && newMessage.channel.type === 'text') {
    reactOnSignUp(newMessage, oldMessage).then();

    // eslint-disable-next-line max-len
    if (newMessage.channel.name.toLowerCase() === config.channels.suggestions_channel.toLowerCase() && !newMessage.author.bot) {
      newMessage.reactions.removeAll().then(() => {
        newMessage.react('👍').then();
        newMessage.react('👎').then();
      });
    }
  }
});

client.on('guildMemberAdd', (member) => {
  const { guild } = member;
  const { memberCount } = guild;

  if (config.main_guild === guild.id) {
    const DMCallback = (m) => {
      const logMessage = `Sent message to ${m.channel.recipient}:\n\`\`\`${m.content}\`\`\``;
      guild.log(logMessage);
    };

    const promise = getConfigValue('server_welcome_message', config.default_server_welcome_message);
    Promise.resolve(promise).then((welcomeMessage) => {
      member.createDM().then((dm) => dm.send(welcomeMessage)).then(DMCallback).catch(() => {
        guild.log(`Couldn't send welcome message to ${member}.`);
      });
    });
  }

  if (memberCount % 100 === 0) {
    const message = `We have ${memberCount} members! :partying_face:`;
    // eslint-disable-next-line max-len
    const channel = guild.channels.cache.find((c) => c.name.toLowerCase() === config.channels.main_channel);
    channel.send(message);
  }

  const now = new Date();
  const { user } = member;

  // eslint-disable-next-line max-len
  Mute.findOne(({ discordId: user.id, guildId: guild.id, mutedTill: { $gte: now } })).then(async (doc) => {
    if (doc) {
      await member.mute();
    }
  });

  Player.findOne({ discordId: user.id }).then((player) => {
    if (!player) {
      player = new Player();
      player.discordId = user.id;
      player.flag = '🇺🇳';

      player.save().then(() => {
        // eslint-disable-next-line no-console
        console.log(`New record for player has been created: ${user.id}`);
      }).catch(() => {
        // eslint-disable-next-line no-console
        console.log(`Could not create record for new player: ${user.id}`);
      });
    }
  });
});

client.on('guildMemberRemove', (member) => {
  Clan.find({ 'members.discordId': member.user.id }).then((clans) => {
    clans.forEach((c) => {
      c.removeMember(member.user.id);
      c.save();
    });
  });

  Player.findOne({ discordId: member.user.id }).then((player) => {
    if (player) {
      player.delete();
    }
  });
});

function checkDeletedPings(message) {
  if (message && message.author && !message.author.bot) {
    const { roles } = message.mentions;
    const socialRoles = [
      config.roles.race_war_search_role.toLowerCase(),
      config.roles.battle_war_search_role.toLowerCase(),
      config.roles.instateam_role.toLowerCase(),
    ];

    if (roles.find((r) => socialRoles.includes(r.name.toLowerCase()))) {
      message.channel.warn('Don\'t ghost ping this role please.', [message.author.id]);
    }
  }
}

client.on('messageDelete', (message) => {
  checkDeletedPings(message);

  SignupsChannel.findOne({ guild: message.guild.id, channel: message.channel.id }).then((doc) => {
    if (doc) {
      setSignupsCountTopic(message.channel);
      const msg = `Signup by ${message.author} in the ${message.channel} was deleted

**Message:**
${message.content}`;
      message.guild.log(msg, true);
    }
  });
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  // eslint-disable-next-line max-len
  const livestreamsChannel = newPresence.guild.channels.cache.find((c) => c.name.toLowerCase() === config.channels.livestreams_channel);

  if (livestreamsChannel) {
    let isStreaming = false;
    let isNewStream = true;

    if (oldPresence) {
      for (const activity of oldPresence.activities) {
        if (activity.isCTRStream()) {
          isNewStream = false;
          break;
        }
      }
    }

    for (const activity of newPresence.activities) {
      const timestamp = Math.floor(activity.createdTimestamp / 1000);

      if (activity.isCTRStream()) {
        isStreaming = true;
      }

      if (activity.isCTRStream() && isNewStream) {
        const fieldValue = [
          `**Streamer**: <@!${newPresence.userID}>`,
          `**Title**: ${activity.details.trim()}`,
          `**Game**: ${activity.state}`,
          `**Started**: ${moment.unix(timestamp).fromNow()}`,
          `**Channel**: ${activity.url}`,
        ];

        const embed = {
          url: activity.url,
          color: 5385620,
          timestamp: new Date(),
          author: {
            name: `New Livestream on ${activity.name}!`,
            url: activity.url,
            icon_url: 'https://i.imgur.com/arlgVeV.png',
          },
          fields: [
            {
              name: 'Details',
              value: fieldValue.join('\n'),
            },
          ],
        };

        const account = activity.url.split('/').pop();

        const url = `http://static-cdn.jtvnw.net/previews-ttv/live_user_${account}-1920x1080.jpg`;
        const promiseThumbnail = axios.get(url, { responseType: 'stream' });
        promiseThumbnail.then((responseThumbnail) => {
          const attachment = new Discord.MessageAttachment(responseThumbnail.data, 'thumbnail.png');
          embed.thumbnail = { url: `attachment://${attachment.name}` };

          livestreamsChannel.send({ embed, files: [attachment] });
        }).catch(() => {
          embed.thumbnail = { url: 'https://i.imgur.com/arlgVeV.png' };
          livestreamsChannel.send({ embed });
        });

        break;
      }
    }

    newPresence.guild.roles.findByName(config.roles.streaming_role).then(async (role) => {
      // eslint-disable-next-line max-len
      const streamingRole = newPresence.member.hasRole(config.roles.streaming_role);

      if (isStreaming && !streamingRole) {
        await newPresence.member.roles.add(role);
      }

      if (!isStreaming && streamingRole) {
        await newPresence.member.roles.remove(role);
      }
    });
  }
});

function checkMutes() {
  const now = new Date();
  Mute.find({ mutedTill: { $lte: now } }).then((docs) => {
    docs.forEach((doc) => {
      const guild = client.guilds.cache.get(doc.guildId);
      guild.members.fetch(doc.discordId).then((member) => {
        // eslint-disable-next-line max-len
        const mutedRole = guild.roles.cache.find((r) => r.name.toLowerCase() === config.roles.muted_role.toLowerCase());

        if (mutedRole && member.isMuted()) {
          member.roles.remove(mutedRole).then();
        }

        doc.delete();
      });
    });
  });
}

new CronJob('* * * * *', checkMutes).start();

try {
  db(() => {
    // eslint-disable-next-line no-console
    console.log('Bot startup successful!');
    client.login(config.token).then();
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
}
