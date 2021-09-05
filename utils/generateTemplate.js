const {
  RACE_ITEMS_FFA,
  RACE_ITEMS_DUOS,
  RACE_ITEMS_3V3,
  RACE_ITEMS_4V4,
  RACE_SURVIVAL,
  RACE_ITEMLESS_1V1,
  RACE_ITEMLESS_FFA,
  RACE_ITEMLESS_DUOS,
  RACE_ITEMLESS_3V3,
  RACE_ITEMLESS_4V4,
  BATTLE_1V1,
  BATTLE_FFA,
  BATTLE_DUOS,
  BATTLE_3V3,
  BATTLE_4V4,
  INSTA_DUOS,
  INSTA_3V3,
  INSTA_4V4,
  LOBBY_MODE_STANDARD,
} = require('../db/models/lobby');

const { Lobby } = require('../db/models/lobby');
const { Player } = require('../db/models/player');
const { Rank } = require('../db/models/rank');

const { flagToCode } = require('../db/regional_indicators');

function getPlayerData(p) {
  let flag = '';
  if (p.flag) {
    const code = flagToCode(p.flag);
    if (code) {
      flag = ` [${code}]`; // space in the beginning is needed
    }
  }

  return `${p.rankedName}${flag}`;
}

const teams = ['A', 'B', 'C', 'D'];
const colors = ['#189dfe', '#ff0000', '#7fff00', '#fff000'];

async function generateTemplate(players, doc) {
  const playerDocs = [];
  for (const p of players) {
    const player = await Player.findOne({ discordId: p });
    playerDocs.push(player);
  }

  let title = '';
  let numberOfMaps = doc.trackCount;

  switch (doc.type) {
    case RACE_ITEMS_FFA:
      title += `Lobby #${doc.number} - FFA`;
      break;
    case RACE_ITEMS_DUOS:
      title += `#title Lobby #${doc.number} - Duos`;
      break;
    case RACE_ITEMS_3V3:
      title += `#title Lobby #${doc.number} - 3 vs. 3`;
      break;
    case RACE_ITEMS_4V4:
      title += `#title Lobby #${doc.number} - 4 vs. 4`;
      break;
    case RACE_SURVIVAL:
      title += `Lobby #${doc.number} - Survival`;
      numberOfMaps = 1;
      break;
    case RACE_ITEMLESS_1V1:
      title += `Lobby #${doc.number} - Itemless 1v1`;
      break;
    case RACE_ITEMLESS_FFA:
      title += `Lobby #${doc.number} - Itemless FFA`;
      break;
    case RACE_ITEMLESS_DUOS:
      title += `#title Lobby #${doc.number} - Itemless Duos`;
      break;
    case RACE_ITEMLESS_3V3:
      title += `#title Lobby #${doc.number} - Itemless 3 vs. 3`;
      break;
    case RACE_ITEMLESS_4V4:
      title += `#title Lobby #${doc.number} - Itemless 4 vs. 4`;
      break;
    case BATTLE_1V1:
      title += `Lobby #${doc.number} - Battle 1v1`;
      break;
    case BATTLE_FFA:
      title += `Lobby #${doc.number} - Battle FFA`;
      break;
    case BATTLE_DUOS:
      title += `#title Lobby #${doc.number} - Battle Duos`;
      break;
    case BATTLE_3V3:
      title += `#title Lobby #${doc.number} - Battle 3 vs. 3`;
      break;
    case BATTLE_4V4:
      title += `#title Lobby #${doc.number} - Battle 4 vs. 4`;
      break;
    case INSTA_DUOS:
      title += `#title Lobby #${doc.number} - Insta Duos`;
      break;
    case INSTA_3V3:
      title += `#title Lobby #${doc.number} - Insta 3 vs. 3`;
      break;
    case INSTA_4V4:
      title += `#title Lobby #${doc.number} - Insta 4 vs. 4`;
      break;
    default:
      break;
  }

  if (doc.isTournament()) {
    const baseLobby = new Lobby();
    baseLobby.type = doc.type;
    baseLobby.mode = LOBBY_MODE_STANDARD;

    if (doc.players.length <= baseLobby.getDefaultPlayerCount()) {
      title += ' Tournament Finals\n';
    } else {
      title += ' Tournament\n';
    }
  } else {
    title += '\n';
  }

  const rows = [];
  const points = `${Array(numberOfMaps).fill(0).join('|')}`;
  if (doc.isTeams()) {
    rows.push(title);
    doc.teamList.forEach((team, i) => {
      if (team.length <= 0) {
        return;
      }

      rows.push(`Team ${teams[i]} ${colors[i]}`);
      team.forEach((playerId) => {
        const p = playerDocs.find((d) => d.discordId === playerId);
        rows.push(`${getPlayerData(p)} ${points}`);
      });
      rows.push('');
    });
  } else {
    rows.push(title);
    const playersAlphabetic = playerDocs.slice()
      .sort((a, b) => a.rankedName.toLowerCase().localeCompare(b.rankedName.toLowerCase()));
    rows.push(...playersAlphabetic.map((p) => `${getPlayerData(p)} ${points}`));
  }

  const template = `${rows.join('\n')}`;
  let encodedData = encodeURI(template);
  encodedData = encodedData.replace(/#/g, '%23');

  const PSNs = [];
  for (const x of playerDocs) {
    const rank = await Rank.findOne({ name: x.rankedName });

    let mmr = doc.getDefaultRank();
    if (rank && rank[doc.type] && rank[doc.type].rank) {
      mmr = parseInt(rank[doc.type].rank, 10);
    }

    PSNs.push(`${x.psn.replace('_', '\\_')} [${mmr}]`);
  }

  return [PSNs, `https://gb2.hlorenzi.com/table?data=${encodedData}`, template];
}

module.exports = generateTemplate;
