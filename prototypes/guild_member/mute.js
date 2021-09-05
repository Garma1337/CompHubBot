const { GuildMember } = require('discord.js');
const moment = require('moment');
const config = require('../../config');
const { Mute } = require('../../db/models/mute');

/**
 * Mutes a member
 * @param duration
 * @returns {Promise<void>}
 */
// eslint-disable-next-line func-names
GuildMember.prototype.mute = async function (duration = moment.duration(1, 'h')) {
  const mutedRole = await this.guild.roles.findByName(config.roles.muted_role);
  this.roles.add(mutedRole);

  const mute = new Mute();
  mute.guildId = this.guild.id;
  mute.discordId = this.id;
  mute.mutedAt = new Date();
  mute.mutedTill = moment().add(duration);
  await mute.save();

  this.guild.channels.cache.forEach((c) => {
    c.createOverwrite(mutedRole, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false,
    });
  });
};
