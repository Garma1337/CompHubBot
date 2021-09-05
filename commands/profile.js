const moment = require('moment');
const config = require('../config');
const { Clan } = require('../db/models/clan');
const { Player } = require('../db/models/player');
const { Rank } = require('../db/models/rank');
const generateSuperScoreRanking = require('../utils/generateSuperScoreRanking');
const { regions } = require('../db/regions');
const { engineStyles } = require('../db/engine_styles');

const {
  RACE_ITEMS_FFA,
  RACE_ITEMS_DUOS,
  RACE_ITEMLESS_FFA,
  BATTLE_FFA,
} = require('../db/models/lobby');

/**
 * Gets the ranking position for a given mode
 * @param rank
 * @param mode
 * @returns {number | string}
 */
function getRankingPosition(rank, mode) {
  mode = mode.toLowerCase();
  let position;

  if (!rank[mode]) {
    position = '-';
  } else {
    position = rank[mode].position + 1;

    if (Number.isNaN(position)) {
      position = '-';
    }
  }

  return position;
}

/**
 * Gets the ranking rating for a given mode
 * @param rank
 * @param mode
 * @returns {number | string}
 */
function getRankingRating(rank, mode) {
  mode = mode.toLowerCase();
  let rating;

  if (!rank[mode]) {
    rating = '-';
  } else {
    rating = parseInt(rank[mode].rank, 10);

    if (Number.isNaN(rating)) {
      rating = '-';
    }
  }

  return rating;
}

/**
 * Gets a region name by key
 * @param regionKey
 * @return String
 */
function getRegionName(regionKey) {
  const region = regions.find((r) => r.key === regionKey);

  if (region) {
    return region.name;
  }

  return '-';
}

/**
 * Returns engine icon by key
 * @param engineStyleKey
 * @returns {string|*}
 */
function getEngineStyleIcon(engineStyleKey) {
  const engineStyle = engineStyles.find((e) => e.key === engineStyleKey);

  if (engineStyle) {
    return engineStyle.emote;
  }

  return '-';
}

/**
 * Returns the profile embed
 * @param member
 * @param color
 * @param fields
 * @param url
 * @return Object
 */
function getEmbed(member, color, fields, url) {
  let avatarUrl;
  if (member.user.avatar) {
    avatarUrl = `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`;
  } else {
    avatarUrl = member.user.defaultAvatarURL;
  }

  const embed = {
    color,
    timestamp: new Date(),
    thumbnail: {
      url: avatarUrl,
    },
    footer: {
      text: `!profile help  •  id: ${member.user.id}`,
    },
    author: {
      name: `${member.user.username}#${member.user.discriminator}'s profile${member.user.bot ? ' (Bot)' : ''}`,
      icon_url: avatarUrl,
    },
    description: 'Check out the PSN profile by using the `!psn` command.',
    fields,
  };

  if (url !== null) {
    embed.author.url = url;
  }

  return embed;
}

module.exports = {
  name: 'profile',
  usage: '@user',
  description: 'Check a player profile.',
  guildOnly: true,
  aliases: ['p'],
  cooldown: 15,
  execute(message, args) {
    let identifier = message.author.id;

    if (args.length > 0) {
      if (message.mentions.users.size > 0) {
        const user = message.mentions.users.first();
        identifier = user.id;
      } else {
        identifier = args[0];
      }
    }

    if (identifier === 'help') {
      const commands = [
        'set_ranked_name',
        'set_psn',
        'set_country',
        'set_nat',
        'set_languages',
        'set_voice_chat',
        'set_region',
        'set_consoles',
        'set_time_zone',
        'set_birthday',
        'set_track',
        'set_character',
        'set_arena',
        'set_color',
        'set_engine',
      ];

      return message.channel.info(`Use these commands to customize your profile:\n\n${commands.map((c) => `${config.prefix}${c}`).join('\n')}`);
    }

    // eslint-disable-next-line max-len,consistent-return
    Player.findOne({ $or: [{ discordId: identifier }, { psn: identifier }, { rankedName: identifier }] }).then((player) => {
      if (!player) {
        return message.channel.warn('There is no such player.');
      }

      const member = message.guild.member(player.discordId);
      if (!member) {
        return message.channel.warn('This player is not on the server anymore.');
      }

      const fields = [];

      Clan.find().then((clans) => {
        /* Profile */
        let psn;
        let flag;
        let region;
        let languages;
        let birthday;
        let voiceChat = [];
        let nat;
        let timeZone;
        let rankedName;
        let favCharacter;
        let favTrack;
        let playerConsoles;
        let favArena;
        let engineStyle;
        let oldPSNIDs = [];
        let oldRankedNames = [];

        if (!player) {
          psn = '-';
          flag = '-';
          region = '-';
          languages = ['-'];
          birthday = '-';
          nat = '-';
          timeZone = '-';
          rankedName = '-';
          favCharacter = '-';
          favTrack = '-';
          playerConsoles = ['-'];
          favArena = '-';
          engineStyle = '-';
          oldPSNIDs = [];
          oldRankedNames = [];
        } else {
          psn = player.psn || '-';
          flag = player.flag || '-';
          region = getRegionName(player.region);
          languages = player.languages.length > 0 ? player.languages : ['-'];
          nat = player.nat || '-';
          timeZone = player.timeZone || '-';
          rankedName = player.rankedName || '-';
          favCharacter = player.favCharacter || '-';
          favTrack = player.favTrack || '-';
          playerConsoles = player.consoles.length > 0 ? player.consoles : ['-'];
          favArena = player.favArena || '-';
          engineStyle = getEngineStyleIcon(player.engineStyle);
          oldPSNIDs = player.oldPSNIDs.length > 0 ? player.oldPSNIDs : [];
          oldRankedNames = player.oldRankedNames.length > 0 ? player.oldRankedNames : [];

          if (!player.birthday) {
            birthday = '-';
          } else {
            const birthDate = new Date(player.birthday);
            birthday = `${birthDate.toLocaleString('default', { month: 'short' })} ${birthDate.getDate()}, ${birthDate.getFullYear()}`;
          }

          if (player.discordVc) {
            voiceChat.push('Discord');
          }

          if (player.ps4Vc) {
            voiceChat.push('PS4');
          }
        }

        if (languages.length < 1) {
          languages.push('-');
        }

        if (voiceChat.length < 1) {
          voiceChat = ['-'];
        }

        const profile = [
          `**PSN**: ${psn.replace('_', '\\_')}`,
          `**Country**: ${flag}`,
          `**Region**: ${region}`,
          `**Languages**: ${languages.join(', ')}`,
          `**Birthday**: ${birthday}`,
          `**Voice Chat**: ${voiceChat.join(', ')}`,
          `**NAT Type**: ${nat}`,
          `**Time Zone**: ${timeZone}`,
          `**Joined**: ${member.joinedAt.toLocaleString('default', { month: 'short' })} ${member.joinedAt.getDate()}, ${member.joinedAt.getFullYear()}`,
          `**Registered**: ${member.user.createdAt.toLocaleString('default', { month: 'short' })} ${member.user.createdAt.getDate()}, ${member.user.createdAt.getFullYear()}`,
        ];

        if (member.user.bot) {
          profile.push('**Discord Bot** :robot:');
        }

        fields.push({
          name: ':busts_in_silhouette: Profile',
          value: profile.join('\n'),
          inline: true,
        });

        /* Game Data */
        let playerClans = [];

        clans.forEach((c) => {
          if (c.hasMember(player.discordId)) {
            playerClans.push(c.shortName);
          }
        });

        if (playerClans.length < 1) {
          playerClans = ['-'];
        }

        const gameData = [
          `**Ranked Name**: ${rankedName.replace('_', '\\_')}`,
          `**Consoles**: ${playerConsoles.join(', ')}`,
          `**Clans**: ${playerClans.join(', ')}`,
          `**Fav. Character**: ${favCharacter}`,
          `**Fav. Track**: ${favTrack}`,
          `**Fav. Arena**: ${favArena}`,
          `**Engine Style**: ${engineStyle}`,
        ];

        // eslint-disable-next-line max-len
        if (member.isVerifiedPlayer()) {
          gameData.push('**Verified Player** :white_check_mark:');
        }

        fields.push({
          name: ':video_game: Game Data',
          value: gameData.join('\n'),
          inline: true,
        });

        fields.push({ name: '\u200B', value: '\u200B' });

        /* Ranks */
        Rank.findOne({ name: rankedName }).then((rank) => {
          generateSuperScoreRanking().then((superScoreRanking) => {
            let playerRanks;
            const superScoreEntry = superScoreRanking.find((r) => r.rankedName === rankedName);

            if (!rank) {
              playerRanks = [
                '**Item Racing Solos**: -',
                '**Item Racing Teams**: -',
                '**Itemless Racing**: -',
                '**Battle Mode**: -',
                '**Super Score**: -',
              ];
            } else {
              const itemsSolosRanking = getRankingPosition(rank, RACE_ITEMS_FFA);
              const itemsTeamsRanking = getRankingPosition(rank, RACE_ITEMS_DUOS);
              const itemlessRanking = getRankingPosition(rank, RACE_ITEMLESS_FFA);
              const battleModeRanking = getRankingPosition(rank, BATTLE_FFA);

              playerRanks = [
                `**Item Racing Solos**: ${itemsSolosRanking !== '-' ? `#${itemsSolosRanking} - ${getRankingRating(rank, RACE_ITEMS_FFA)}` : '-'}`,
                `**Item Racing Teams**: ${itemsTeamsRanking !== '-' ? `#${itemsTeamsRanking} - ${getRankingRating(rank, RACE_ITEMS_DUOS)}` : '-'}`,
                `**Itemless Racing**: ${itemlessRanking !== '-' ? `#${itemlessRanking} - ${getRankingRating(rank, RACE_ITEMLESS_FFA)}` : '-'}`,
                `**Battle Mode**: ${battleModeRanking !== '-' ? `#${battleModeRanking} - ${getRankingRating(rank, BATTLE_FFA)}` : '-'}`,
                `**Super Score**: ${superScoreEntry ? `#${superScoreEntry.rank} - ${superScoreEntry.superScore}` : '-'}`,
              ];
            }

            fields.push({
              name: ':checkered_flag: Rankings',
              value: playerRanks.join('\n'),
              inline: true,
            });

            /* Achievements */
            const achievements = [];

            // eslint-disable-next-line max-len
            if (member.hasRole(config.roles.donator_role.toLowerCase())) {
              achievements.push('Donator');
            }

            // eslint-disable-next-line max-len
            if (member.hasRole(config.roles.wc_champion_role.toLowerCase())) {
              achievements.push('World Cup Champion');
            }

            // eslint-disable-next-line max-len
            if (member.hasRole(config.roles.tournament_champion_role.toLowerCase())) {
              achievements.push('Tournament Champion');
            }

            // eslint-disable-next-line max-len
            if (member.hasRole(config.roles.ranked_champion_role.toLowerCase())) {
              achievements.push('Ranked Champion');
            }

            // eslint-disable-next-line max-len
            if (member.hasRole(config.roles.challenge_master_role.toLowerCase())) {
              achievements.push('Challenge Master');
            }

            // eslint-disable-next-line max-len
            if (member.hasRole(config.roles.nitro_booster_role.toLowerCase())) {
              achievements.push('Server Booster');
            }

            if (player.discordId === '462335970126200832') {
              achievements.push('Shot in the Head by <@!588477134197096485>');
            }

            const currentDate = moment(new Date());
            const joinDate = moment(member.joinedAt);

            if (currentDate.diff(joinDate, 'years', true) > 1) {
              achievements.push('Member for over 1 year');
            }

            if (player
              && player.psn
              && player.flag
              && player.nat
              && player.timeZone
              && player.birthday
              && (player.discordVc || player.ps4Vc)
              && player.rankedName
              && player.favCharacter
              && player.favTrack
              && player.languages.length > 0
              && player.consoles.length > 0
              && player.favArena
              && player.engineStyle
            ) {
              achievements.push('Complete Profile');
            }

            const achievementCount = achievements.length;
            if (achievementCount < 1) {
              achievements.push('None');
            }

            fields.push({
              name: `:trophy: Achievements (${achievementCount})`,
              value: achievements.join('\n'),
              inline: true,
            });

            let url = null;
            if (player && player.psn) {
              url = `https://my.playstation.com/profile/${player.psn}`;
            }

            if (oldPSNIDs.length > 0 || oldRankedNames.length > 0) {
              fields.push({ name: '\u200B', value: '\u200B' });

              const aliases = [
                `**Former PSNs**: ${oldPSNIDs.join(', ')}`,
                `**Former Ranked Names**: ${oldRankedNames.join(', ')}`,
              ];

              fields.push({
                name: ':spy: Aliases',
                value: aliases.join('\n'),
              });
            }

            const color = player.color || member.displayColor;

            const embed = getEmbed(member, Number(color), fields, url);
            return message.channel.send({ embed });
          });
        });
      });
    });

    return true;
  },
};
