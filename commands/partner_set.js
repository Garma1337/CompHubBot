const { Duo } = require('../db/models/duo');
const { Lobby } = require('../db/models/lobby');
const { Player } = require('../db/models/player');
const { RankedBan } = require('../db/models/ranked_ban');
const { RACE_DUOS } = require('../db/models/lobby');

module.exports = {
  name: 'partner_set',
  description: 'Set your partner for Ranked Duos.',
  guildOnly: true,
  aliases: ['set_partner', 'partner_s', 'marry', 'fuck'],
  cooldown: 15,
  // eslint-disable-next-line consistent-return
  async execute(message) {
    if (!message.mentions.members.size) {
      return message.channel.warn('You should tag your partner.');
    }

    const { author, guild } = message;
    const partner = message.mentions.members.first();

    if (author.id === partner.id || partner.user.bot) {
      return message.channel.warn('You cannot set yourself or a bot as your partner.');
    }

    // eslint-disable-next-line max-len
    if (!message.member.isVerifiedPlayer()) {
      return message.channel.warn('You are not verified.');
    }

    // eslint-disable-next-line max-len
    if (!partner.isVerifiedPlayer()) {
      return message.channel.warn('Your partner is not verified.');
    }

    const authorBanned = await RankedBan.findOne({ discordId: author.id, guildId: guild.id });
    if (authorBanned) {
      return message.channel.warn('You are banned.');
    }

    const partnerBanned = await RankedBan.findOne({ discordId: partner.id, guildId: guild.id });
    if (partnerBanned) {
      return message.channel.warn('Your partner is banned.');
    }

    const authorPlayer = await Player.findOne({ discordId: author.id });
    if (!authorPlayer || !authorPlayer.psn) {
      return message.channel.warn('You need to set your PSN.');
    }

    const partnerPSN = await Player.findOne({ discordId: partner.id });
    if (!partnerPSN || !partnerPSN.psn) {
      return message.channel.warn('Your partner needs to set their PSN.');
    }

    // eslint-disable-next-line max-len
    const authorSavedDuo = await Duo.findOne({ guild: guild.id, $or: [{ discord1: author.id }, { discord2: author.id }] });
    if (authorSavedDuo) {
      // eslint-disable-next-line max-len
      const savedPartner = authorSavedDuo.discord1 === author.id ? authorSavedDuo.discord2 : authorSavedDuo.discord1;
      return message.channel.warn(`${author}, you've already set a partner: <@${savedPartner}>.`);
    }

    // eslint-disable-next-line max-len
    const partnerSavedDuo = await Duo.findOne({ guild: guild.id, $or: [{ discord1: partner.id }, { discord2: partner.id }] });
    if (partnerSavedDuo) {
      return message.channel.warn(`${author}, ${partner} already has another partner.`);
    }

    // eslint-disable-next-line max-len
    const lobby = await Lobby.findOne({ type: RACE_DUOS, players: { $in: [author.id, partner.id] } });
    if (lobby) {
      return message.channel.warn('You can\'t set a partner while one of you is in a lobby.');
    }

    message.channel.info(`Please confirm that you are a partner of ${author} for Ranked Duos.`, [partner.id]).then((confirmMessage) => {
      message.delete();
      confirmMessage.react('✅');

      const filter = (r, u) => r.emoji.name === '✅' && u.id === partner.id;
      // eslint-disable-next-line consistent-return
      confirmMessage.awaitReactions(filter, { maxUsers: 1, time: 60000, errors: ['time'] }).then(async () => {
        if (confirmMessage.deleted) {
          return message.channel.error('Command cancelled. Stop abusing staff powers.');
        }

        confirmMessage.delete();

        // eslint-disable-next-line no-shadow
        const lobby = await Lobby.findOne({ type: RACE_DUOS, players: author.id });
        if (lobby) {
          return message.channel.error(`Command cancelled: ${author} joined a lobby.`);
        }

        // eslint-disable-next-line max-len
        const authorDuo = await Duo.findOne({ guild: guild.id, $or: [{ discord1: author.id }, { discord2: author.id }] });
        // eslint-disable-next-line max-len
        const partnerDuo = await Duo.findOne({ guild: guild.id, $or: [{ discord1: partner.id }, { discord2: partner.id }] });
        if (authorDuo || partnerDuo) {
          return message.channel.error('Command cancelled: one of you has already set a partner.');
        }

        const duo = new Duo();
        duo.guild = guild.id;
        duo.discord1 = author.id;
        duo.discord2 = partner.id;
        duo.date = new Date();
        duo.save().then(() => {
          message.channel.success(`${author} & ${partner} duo has been set.`).then((m) => {
            m.delete({ timeout: 5000 });
          });
        });
      }).catch(() => {
        message.channel.error('Command cancelled.');
      });
    });
  },
};
