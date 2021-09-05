const { Lobby } = require('../db/models/lobby');
const { Player } = require('../db/models/player');
const { RankedBan } = require('../db/models/ranked_ban');
const { Team } = require('../db/models/team');
const { RACE_3V3, RACE_4V4 } = require('../db/models/lobby');

module.exports = {
  name: 'team_set',
  description: 'Set your team for Ranked 3 vs. 3 and ranked 4 vs. 4.',
  guildOnly: true,
  aliases: ['set_team', 'team_s'],
  cooldown: 15,
  // eslint-disable-next-line consistent-return
  async execute(message) {
    const tagsCount = message.mentions.members.size;
    if (!tagsCount) {
      return message.channel.warn('You should tag your teammates.');
    }

    if (![2, 3].includes(tagsCount)) {
      return message.channel.warn('You should tag 3 or 4 people.');
    }

    let mode;
    if (tagsCount === 2) {
      mode = '3 vs. 3';
    } else if (tagsCount === 3) {
      mode = '4 vs. 4';
    }

    const { author, guild } = message;

    const teammates = message.mentions.members;

    const teammateIds = teammates.map((t) => t.id);
    const teammateBot = teammates.find((t) => t.user.bot);

    if (teammateIds.includes(author.id) || teammateBot) {
      return message.channel.warn('You cannot set a team with yourself or a bot.');
    }

    // eslint-disable-next-line max-len
    if (!message.member.isVerifiedPlayer()) {
      return message.channel.warn('you are not verified.');
    }

    const authorBanned = await RankedBan.findOne({ discordId: author.id, guildId: guild.id });
    if (authorBanned) {
      return message.channel.warn('You are banned from ranked lobbies.');
    }

    const authorPlayer = await Player.findOne({ discordId: author.id });
    if (!authorPlayer || !authorPlayer.psn) {
      return message.channel.warn('You didn\'t set your PSN ID.');
    }

    const authorSavedTeam = await Team.findOne({ guild: guild.id, players: author.id });
    if (authorSavedTeam) {
      return message.channel.warn('You are already in a team.');
    }

    // eslint-disable-next-line max-len
    const lobby = await Lobby.findOne({ type: { $in: [RACE_3V3, RACE_4V4] }, players: { $in: [author.id, ...teammateIds] } });
    if (lobby) {
      return message.channel.warn('You can\'t set a team while one of you is playing in a lobby.');
    }

    for (const teammate of teammates.array()) {
      // eslint-disable-next-line max-len
      if (!teammate.isVerifiedPlayer()) {
        return message.channel.warn(`${teammate} isn't verified.`);
      }

      const partnerBanned = await RankedBan.findOne({ discordId: teammate.id, guildId: guild.id });
      if (partnerBanned) {
        return message.channel.warn(`${teammate} is banned.`);
      }

      const partnerPSN = await Player.findOne({ discordId: teammate.id });
      if (!partnerPSN || !partnerPSN.psn) {
        return message.channel.warn(`${teammate} didn't set their PSN ID.`);
      }

      const partnerSavedTeam = await Team.findOne({
        guild: guild.id,
        player: teammate.id,
      });
      if (partnerSavedTeam) {
        return message.channel.warn(`${teammate} is already in another team.`);
      }
    }

    const teammatesPing = teammates.map((t) => t.toString()).join(', ');
    message.channel.info(`${teammatesPing}, please confirm that you are teammates of ${author} for ${mode} lobbies.`).then((confirmMessage) => {
      message.delete();
      confirmMessage.react('✅');

      const filter = (r, u) => r.emoji.name === '✅' && teammateIds.includes(u.id);
      // eslint-disable-next-line consistent-return
      confirmMessage.awaitReactions(filter, {
        maxUsers: tagsCount,
        time: tagsCount * 60000,
        errors: ['time'],
        // eslint-disable-next-line consistent-return
      }).then(async () => {
        if (confirmMessage.deleted) {
          return message.channel.error('Command cancelled. Stop abusing staff powers.');
        }

        confirmMessage.delete();

        // eslint-disable-next-line no-shadow,max-len
        const lobby = await Lobby.findOne({ guild: guild.id, type: { $in: [RACE_3V3, RACE_4V4] }, players: author.id });
        if (lobby) {
          return message.channel.warn(`Command cancelled: ${author} joined another lobby.`);
        }

        // eslint-disable-next-line max-len
        const teamExists = await Team.findOne({ guild: guild.id, players: { $in: [author.id, ...teammateIds] } });
        if (teamExists) {
          return message.channel.warn('Command cancelled: One of you has already set a team.');
        }

        const teamPing = [author, ...teammates.array()].map((p) => p.toString()).join(', ');

        const team = new Team();
        team.guild = guild.id;
        team.players = [author.id, ...teammateIds];
        team.date = new Date();
        team.save().then(() => {
          message.channel.success(`Team ${teamPing} was created.`).then((m) => {
            m.delete({ timeout: 5000 });
          });
        });
      }).catch(() => {
        message.channel.error('Command cancelled.');
      });
    });
  },
};
