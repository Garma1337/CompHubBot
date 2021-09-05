const config = require('../config');
const { Player } = require('../db/models/player');
const { Rank } = require('../db/models/rank');
const generateSuperScoreRanking = require('../utils/generateSuperScoreRanking');

const {
  RACE_ITEMS_FFA,
  RACE_ITEMS_DUOS,
  RACE_ITEMLESS_FFA,
  BATTLE_FFA,
} = require('../db/models/lobby');

const ranks = {
  [RACE_ITEMS_FFA]: 'Item Solos Racing',
  [RACE_ITEMS_DUOS]: 'Item Teams Racing',
  [RACE_ITEMLESS_FFA]: 'Itemless Racing',
  [BATTLE_FFA]: 'Battle Mode',
};

function sendMessage(message, rank) {
  const fields = Object.entries(ranks).map(([key, name]) => {
    const position = rank[key].position + 1;
    const r = parseInt(rank[key].rank, 10);

    let value = `#${position} - ${r}`;
    if (Number.isNaN(position) || Number.isNaN(r)) {
      value = '-';
    }

    return ({
      name,
      value,
      inline: true,
    });
  });

  generateSuperScoreRanking().then((superScoreRanking) => {
    const superScoreEntry = superScoreRanking.find((r) => r.rankedName === rank.name);

    fields.push({
      name: 'Super Score',
      value: `${superScoreEntry ? `#${superScoreEntry.rank} - ${superScoreEntry.superScore}` : '-'}`,
      inline: true,
    });

    // add spacer so that the layout doesn't get fucked
    fields.push({
      name: '\u200B',
      value: '\u200B',
      inline: true,
    });

    message.channel.send({
      embed: {
        color: config.default_embed_color,
        title: `${rank.name}'s ranks`,
        fields,
      },
    });
  });
}

module.exports = {
  name: 'rank',
  description: 'Check your rank',
  guildOnly: true,
  cooldown: 15,
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    if (args.length) {
      if (args[0] === 'list') {
        generateSuperScoreRanking().then((superScoreRanking) => {
          const elements = superScoreRanking.map((sr) => `**${sr.rank}**. ${sr.flag} <@!${sr.discordId}>\n**PSN**: ${sr.psn.replace('_', '\\_')}\n**Ranked Name**: ${sr.rankedName.replace('_', '\\_')}\n**Score**: ${sr.superScore}\n`);

          message.channel.sendPageableContent(message.author.id, {
            outputType: 'embed',
            elements,
            elementsPerPage: 5,
            embedOptions: {
              heading: 'Super Score Ranking',
              image: 'https://static.wikia.nocookie.net/crashban/images/5/5a/CTRNF-Master_Wheels.png',
            },
            buttonCollectorOptions: { time: 3600000 },
          });
        });
      } else {
        let rankedName;

        const user = message.mentions.users.first();
        if (!user) {
          rankedName = args[0];
        } else {
          const player = await Player.findOne({ discordId: user.id });

          if (!player) {
            return message.channel.warn(`<@!${user.id}> has not played any ranked matches yet.`);
          }

          rankedName = player.rankedName || '-';
        }

        // eslint-disable-next-line consistent-return
        Rank.findOne({ name: rankedName }).then((rank) => {
          if (!rank) {
            return message.channel.warn(`${rankedName} has not played any ranked matches yet.`);
          }

          sendMessage(message, rank);
        });
      }
    } else {
      // eslint-disable-next-line consistent-return
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player || !player.rankedName) {
          return message.channel.warn('You have not played any ranked matches yet.');
        }

        // eslint-disable-next-line consistent-return
        Rank.findOne({ name: player.rankedName }).then((rank) => {
          if (!rank) {
            return message.channel.warn('You have not played any ranked matches yet.');
          }

          sendMessage(message, rank);
        });
      });
    }
  },
};
